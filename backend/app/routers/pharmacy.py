from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.database import get_db
from app.models.appointment import Appointment, AppointmentStatus

# 🛡️ SECURITY IMPORT: Aphiwe's RBAC Guard
from app.core.security import RoleChecker

router = APIRouter(prefix="/pharmacy", tags=["Pharmacy"])

# OWASP A01 Defense: Only tokens with 'pharmacy' or 'admin' roles can access these routes
allow_pharmacy = RoleChecker(["pharmacy", "admin"])

@router.get(
    "/incoming",
    summary="Get files arriving from the filing room",
    dependencies=[Depends(allow_pharmacy)] # 🔒 ROUTE LOCKED
)
def get_incoming_files(db: Session = Depends(get_db)):
    """
    Pharmacy Kanban Column 1: Files that the clerk has pulled but haven't been processed.
    """
    stmt = (
        select(Appointment)
        .where(Appointment.status == AppointmentStatus.pulled)
        .order_by(Appointment.time_slot)
    )
    
    appointments = db.execute(stmt).scalars().all()
    return {"count": len(appointments), "appointments": appointments}

@router.patch(
    "/pack/{appointment_id}",
    summary="Complete JIT Administrative Pre-packing",
    dependencies=[Depends(allow_pharmacy)] # 🔒 ROUTE LOCKED
)
def administratively_pack_file(appointment_id: int, db: Session = Depends(get_db)):
    """
    Pharmacist action — Prints labels and preps the bag (Insulin stays in fridge).
    Status transition: pulled → ready.
    """
    appt = db.get(Appointment, appointment_id)

    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    if appt.status != AppointmentStatus.pulled:
        raise HTTPException(status_code=409, detail="File must be pulled first.")

    appt.status = AppointmentStatus.ready # (You might need to add 'ready' to your enum if Tshepang hasn't yet)
    db.commit()
    return {"status": "ready", "id": appointment_id, "message": "Admin workflow complete."}

@router.patch(
    "/dispense/{appointment_id}",
    summary="Dispense insulin to patient",
    dependencies=[Depends(allow_pharmacy)] # 🔒 ROUTE LOCKED
)
def dispense_medication(appointment_id: int, db: Session = Depends(get_db)):
    """
    Pharmacist action — The patient has arrived with their Express Code. Hand over the meds.
    Status transition: ready → dispensed.
    """
    appt = db.get(Appointment, appointment_id)

    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    appt.status = AppointmentStatus.dispensed
    db.commit()
    return {"status": "dispensed", "id": appointment_id, "message": "Medication dispensed successfully."}