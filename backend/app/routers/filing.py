from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.database import get_db
from app.models.appointment import Appointment, AppointmentStatus
from app.schemas.filing import FilingAppointmentsResponse, FilingAppointmentOut

router = APIRouter(prefix="/filing", tags=["Filing Room"])

# Statuses that mean the file has already been actioned —
# explicitly excluded to prevent duplicate admin processing.
EXCLUDED_STATUSES = {AppointmentStatus.pulled, AppointmentStatus.dispensed}


@router.get(
    "/upcoming",
    response_model=FilingAppointmentsResponse,
    summary="Get appointments due for file pull in 3 days",
    description=(
        "Returns all confirmed patient appointments whose collection date is "
        "exactly 3 days from today. Patients with a status of 'pulled' or "
        "'dispensed' are explicitly filtered out."
    ),
)
def get_upcoming_appointments(db: Session = Depends(get_db)):
    """
    Filing clerk feed — appointments confirmed for 3 days from now.

    Filters:
        status  = 'confirmed'
        collection_date = today + 3 days
        status NOT IN ('pulled', 'dispensed')   ← explicit guard
    """
    target_date = date.today() + timedelta(days=3)

    stmt = (
        select(Appointment)
        .where(
            Appointment.collection_date == target_date,
            Appointment.status == AppointmentStatus.confirmed,
            Appointment.status.not_in(list(EXCLUDED_STATUSES)),  # explicit duplicate guard
        )
        .order_by(Appointment.time_slot)
    )

    rows = db.execute(stmt).scalars().all()

    appointments = [FilingAppointmentOut.model_validate(r) for r in rows]

    return FilingAppointmentsResponse(
        count=len(appointments),
        appointments=appointments,
    )


# ── PATCH /filing/files/:id/send ─────────────────────────────────────────────
@router.patch(
    "/files/{appointment_id}/send",
    summary="Mark file as sent to pharmacy",
)
def send_file_to_pharmacy(
    appointment_id: int,
    db: Session = Depends(get_db),
):
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