from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import date, timedelta

from app.core.database import get_db
from app.core.security import verify_token
from app.models.appointment import Appointment, AppointmentStatus

router = APIRouter(prefix="/pharmacy", tags=["Pharmacy"])


def _to_card(appt: Appointment) -> dict:
    """Map an Appointment row to the card shape PharmacyPage expects."""
    return {
        "id":   appt.id,
        "name": appt.patient_name,
        "code": appt.folder_number,
        "slot": appt.time_slot,
    }


# ── GET /pharmacy/incoming ────────────────────────────────────────────────────
@router.get("/incoming", summary="Files pulled by filing — To Pack")
def get_incoming(
    db:    Session = Depends(get_db),
    _user: dict    = Depends(verify_token),
):
    """
    Returns appointments with status = 'pulled'.
    These are files the filing clerk has sent to pharmacy — ready to be packed.
    """
    rows = (
        db.execute(
            select(Appointment)
            .where(Appointment.status == AppointmentStatus.pulled)
            .where(Appointment.collection_date == date.today())
            .order_by(Appointment.time_slot)
        )
        .scalars()
        .all()
    )
    return [_to_card(r) for r in rows]


# ── GET /pharmacy/ready ───────────────────────────────────────────────────────
@router.get("/ready", summary="Packed files — Ready for patient pickup")
def get_ready(
    db:    Session = Depends(get_db),
    _user: dict    = Depends(verify_token),
):
    """
    Returns appointments with status = 'dispensed'.
    These have been packed and are waiting for the patient to collect.
    """
    rows = (
        db.execute(
            select(Appointment)
            .where(Appointment.status == AppointmentStatus.dispensed)
            .where(Appointment.collection_date == date.today())
            .order_by(Appointment.time_slot)
        )
        .scalars()
        .all()
    )
    return [_to_card(r) for r in rows]


# ── PATCH /pharmacy/cards/:id/pack ────────────────────────────────────────────
@router.patch("/cards/{appointment_id}/pack", summary="Mark file as packed — Incoming → Ready")
def mark_packed(
    appointment_id: int,
    db:    Session = Depends(get_db),
    _user: dict    = Depends(verify_token),
):
    """
    Moves a card from the Incoming column to Ready.
    Status transition: pulled → dispensed.
    """
    appt = db.get(Appointment, appointment_id)

    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found.")

    if appt.status != AppointmentStatus.pulled:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot pack: appointment status is '{appt.status}', expected 'pulled'.",
        )

    appt.status = AppointmentStatus.dispensed
    db.commit()
    db.refresh(appt)
    return _to_card(appt)


# ── PATCH /pharmacy/cards/:id/collect ────────────────────────────────────────
@router.patch("/cards/{appointment_id}/collect", summary="Confirm patient collected medication")
def mark_collected(
    appointment_id: int,
    db:    Session = Depends(get_db),
    _user: dict    = Depends(verify_token),
):
    """
    Confirms the patient has collected their medication.
    Shifts collection_date to yesterday so it drops off the today-filtered
    ready list without requiring a schema change.
    """
    appt = db.get(Appointment, appointment_id)

    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found.")

    if appt.status != AppointmentStatus.dispensed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot collect: appointment status is '{appt.status}', expected 'dispensed'.",
        )

    appt.collection_date = date.today() - timedelta(days=1)
    db.commit()
    return {"status": "collected", "id": appointment_id}