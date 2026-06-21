from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.database import get_db
from app.models.appointment import Appointment, AppointmentStatus
from app.schemas.filing import FilingAppointmentsResponse, FilingAppointmentOut
from app.core.security import RoleChecker

router = APIRouter(prefix="/filing", tags=["Filing Room"])

# OWASP A01 Defense: Only tokens with 'filing' or 'admin' roles can access these routes
allow_filing = RoleChecker(["filing", "admin"])

# Statuses that mean the file has already been actioned — exclude from the clerk's queue.
# pulled    — already sent to pharmacy
# ready     — pharmacist has packed it
# collected — patient collected
# dispensed — legacy status, same end-state
# cancelled — patient opted out via bot; must not resurface in the queue
EXCLUDED_STATUSES = {
    AppointmentStatus.pulled,
    AppointmentStatus.ready,
    AppointmentStatus.collected,
    AppointmentStatus.dispensed,
    AppointmentStatus.cancelled,
}


def _to_filing_out(appt: Appointment) -> FilingAppointmentOut:
    """
    Maps an Appointment row to the filing clerk card shape.
    TODO: join Patient table to get a real name once the EncryptedString
          migration lands. For now we use a placeholder.
    """
    return FilingAppointmentOut(
        id=appt.appointment_id,
        patient_name=f"Patient #{appt.patient_id}",  # TODO: Patient join
        folder_number=appt.express_code or f"FRE-{appt.appointment_id:04d}",
        collection_date=appt.collection_date,
        time_slot=appt.time_slot,
    )


@router.get(
    "/upcoming",
    response_model=FilingAppointmentsResponse,
    summary="Get appointments due for file pull in 3 days",
    dependencies=[Depends(allow_filing)],  # 🔒 ROUTE LOCKED
)
def get_upcoming_appointments(db: Session = Depends(get_db)):
    """
    Filing clerk feed — confirmed appointments due for collection in 3 days,
    excluding any that have already been actioned.
    """
    target_date = date.today() + timedelta(days=3)

    stmt = (
        select(Appointment)
        .where(
            Appointment.collection_date == target_date,
            Appointment.status.not_in([s.value for s in EXCLUDED_STATUSES]),
        )
        .order_by(Appointment.time_slot)
    )

    rows = db.execute(stmt).scalars().all()
    appointments = [_to_filing_out(r) for r in rows]

    return FilingAppointmentsResponse(
        count=len(appointments),
        appointments=appointments,
    )


@router.patch(
    "/files/{appointment_id}/send",
    summary="Mark file as sent to pharmacy",
    dependencies=[Depends(allow_filing)],  # 🔒 ROUTE LOCKED
)
def send_file_to_pharmacy(appointment_id: int, db: Session = Depends(get_db)):
    """
    Filing clerk action — marks a file as pulled and sent to the pharmacy queue.
    Status transition: confirmed → pulled.
    """
    appt = db.get(Appointment, appointment_id)

    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    if appt.status != AppointmentStatus.confirmed:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot send: status is '{appt.status}', expected 'confirmed'.",
        )

    appt.status = AppointmentStatus.pulled
    db.commit()
    db.refresh(appt)
    return {"status": "pulled", "id": appointment_id}
