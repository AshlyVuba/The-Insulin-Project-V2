from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.models.appointment import Appointment, AppointmentStatus
from app.core.security import RoleChecker

router = APIRouter(prefix="/pharmacy", tags=["Pharmacy"])

# OWASP A01 Defense: Only tokens with 'pharmacy' or 'admin' roles can access these routes
allow_pharmacy = RoleChecker(["pharmacy", "admin"])


# ── Response schema ────────────────────────────────────────────────────────────
# Maps Appointment rows to the card shape the Kanban frontend expects.
# TODO: Once the Patient join + EncryptedString migration lands, replace
#       `name` with f"{patient.first_name} {patient.last_name}".

class PharmacyCard(BaseModel):
    id: int
    name: str   # placeholder: patient_id until Patient join is added
    code: str   # express_code, or a fallback if not yet generated
    slot: str   # time_slot

    model_config = {"from_attributes": True}


def _to_card(appt: Appointment) -> PharmacyCard:
    return PharmacyCard(
        id=appt.appointment_id,
        name=f"Patient #{appt.patient_id}",  # TODO: join Patient table for real name
        code=appt.express_code or f"INS-{appt.appointment_id}",
        slot=appt.time_slot,
    )


# ── GET /pharmacy/incoming ─────────────────────────────────────────────────────

@router.get(
    "/incoming",
    summary="Kanban col 1 — files sent from filing room, awaiting pack",
    dependencies=[Depends(allow_pharmacy)],  # 🔒 ROUTE LOCKED
)
def get_incoming_files(db: Session = Depends(get_db)):
    """Status filter: pulled."""
    stmt = (
        select(Appointment)
        .where(Appointment.status == AppointmentStatus.pulled)
        .order_by(Appointment.time_slot)
    )
    appointments = db.execute(stmt).scalars().all()
    cards = [_to_card(a) for a in appointments]
    return {"count": len(cards), "appointments": cards}


# ── GET /pharmacy/ready ────────────────────────────────────────────────────────

@router.get(
    "/ready",
    summary="Kanban col 2 — packed files waiting for patient pickup",
    dependencies=[Depends(allow_pharmacy)],  # 🔒 ROUTE LOCKED
)
def get_ready_files(db: Session = Depends(get_db)):
    """Status filter: ready."""
    stmt = (
        select(Appointment)
        .where(Appointment.status == AppointmentStatus.ready)
        .order_by(Appointment.time_slot)
    )
    appointments = db.execute(stmt).scalars().all()
    cards = [_to_card(a) for a in appointments]
    return {"count": len(cards), "appointments": cards}


# ── PATCH /pharmacy/cards/:id/pack ────────────────────────────────────────────

@router.patch(
    "/cards/{appointment_id}/pack",
    summary="Pharmacist marks file as packed — pulled → ready",
    dependencies=[Depends(allow_pharmacy)],  # 🔒 ROUTE LOCKED
)
def pack_file(appointment_id: int, db: Session = Depends(get_db)):
    """
    Prints labels and preps the bag (insulin stays in fridge).
    Status transition: pulled → ready.
    """
    appt = db.get(Appointment, appointment_id)

    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    if appt.status != AppointmentStatus.pulled:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot pack: status is '{appt.status}', expected 'pulled'.",
        )

    appt.status = AppointmentStatus.ready
    db.commit()
    return {"status": "ready", "id": appointment_id}


# ── PATCH /pharmacy/cards/:id/collect ─────────────────────────────────────────

@router.patch(
    "/cards/{appointment_id}/collect",
    summary="Patient collected their medication — ready → collected",
    dependencies=[Depends(allow_pharmacy)],  # 🔒 ROUTE LOCKED
)
def collect_medication(appointment_id: int, db: Session = Depends(get_db)):
    """
    Patient has arrived with their Express Code and collected their meds.
    Status transition: ready → collected.
    """
    appt = db.get(Appointment, appointment_id)

    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    if appt.status != AppointmentStatus.ready:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot collect: status is '{appt.status}', expected 'ready'.",
        )

    appt.status = AppointmentStatus.collected
    db.commit()
    return {"status": "collected", "id": appointment_id}
