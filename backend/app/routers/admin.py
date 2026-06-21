"""
admin.py — Full CRUD endpoints for the Admin dashboard.
All routes require the 'admin' role JWT.
"""
from datetime import date, datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.security import RoleChecker
from app.models.appointment import Appointment, AppointmentStatus
from app.models.patient import Patient
from app.models.clinic import Clinic
from app.core.encryption import hash_phone

router = APIRouter(prefix="/admin", tags=["Admin CRUD"])

allow_admin = RoleChecker(["admin"])


# ─────────────────────────────────────────────────────────────────────────────
# DASHBOARD STATS
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/stats", dependencies=[Depends(allow_admin)])
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Returns headline numbers for the admin overview cards."""
    total_patients     = db.execute(select(func.count(Patient.patient_id))).scalar()
    total_appointments = db.execute(select(func.count(Appointment.appointment_id))).scalar()
    today_appts        = db.execute(
        select(func.count(Appointment.appointment_id))
        .where(Appointment.collection_date == date.today())
    ).scalar()
    pending  = db.execute(select(func.count(Appointment.appointment_id)).where(Appointment.status == AppointmentStatus.pending)).scalar()
    confirmed = db.execute(select(func.count(Appointment.appointment_id)).where(Appointment.status == AppointmentStatus.confirmed)).scalar()
    collected = db.execute(select(func.count(Appointment.appointment_id)).where(Appointment.status == AppointmentStatus.collected)).scalar()

    return {
        "total_patients":     total_patients,
        "total_appointments": total_appointments,
        "today_appointments": today_appts,
        "pending":            pending,
        "confirmed":          confirmed,
        "collected":          collected,
    }


# ─────────────────────────────────────────────────────────────────────────────
# PATIENTS CRUD
# ─────────────────────────────────────────────────────────────────────────────

class PatientCreate(BaseModel):
    clinic_id:                int
    national_id:              str
    facility_patient_number:  str
    first_name:               str
    last_name:                str
    phone_number:             Optional[str] = None
    date_of_birth:            Optional[date] = None
    gender:                   Optional[str] = None
    tracking_status:          str = "active"


class PatientUpdate(BaseModel):
    first_name:        Optional[str] = None
    last_name:         Optional[str] = None
    phone_number:      Optional[str] = None
    date_of_birth:     Optional[date] = None
    gender:            Optional[str] = None
    tracking_status:   Optional[str] = None
    clinic_id:         Optional[int] = None


def _patient_out(p: Patient) -> dict:
    return {
        "patient_id":               p.patient_id,
        "clinic_id":                p.clinic_id,
        "national_id":              p.national_id,
        "facility_patient_number":  p.facility_patient_number,
        "first_name":               p.first_name,
        "last_name":                p.last_name,
        "phone_number":             p.phone_number,
        "date_of_birth":            str(p.date_of_birth) if p.date_of_birth else None,
        "gender":                   p.gender,
        "tracking_status":          p.tracking_status,
        "created_at":               str(p.created_at) if p.created_at else None,
    }


@router.get("/patients", dependencies=[Depends(allow_admin)])
def list_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    rows = db.execute(select(Patient).offset(skip).limit(limit)).scalars().all()
    return {"count": len(rows), "patients": [_patient_out(p) for p in rows]}


@router.get("/patients/{patient_id}", dependencies=[Depends(allow_admin)])
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    p = db.get(Patient, patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found.")
    return _patient_out(p)


@router.post("/patients", status_code=status.HTTP_201_CREATED, dependencies=[Depends(allow_admin)])
def create_patient(body: PatientCreate, db: Session = Depends(get_db)):
    # Duplicate national_id check
    existing = db.execute(select(Patient).where(Patient.national_id == body.national_id)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="A patient with this national ID already exists.")

    p = Patient(
        clinic_id=body.clinic_id,
        national_id=body.national_id,
        facility_patient_number=body.facility_patient_number,
        first_name=body.first_name,
        last_name=body.last_name,
        phone_number=body.phone_number,
        date_of_birth=body.date_of_birth,
        gender=body.gender,
        tracking_status=body.tracking_status,
        created_at=datetime.now(timezone.utc),
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return _patient_out(p)


@router.patch("/patients/{patient_id}", dependencies=[Depends(allow_admin)])
def update_patient(patient_id: int, body: PatientUpdate, db: Session = Depends(get_db)):
    p = db.get(Patient, patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found.")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(p, field, value)

    db.commit()
    db.refresh(p)
    return _patient_out(p)


@router.delete("/patients/{patient_id}", dependencies=[Depends(allow_admin)])
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    p = db.get(Patient, patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found.")
    db.delete(p)
    db.commit()
    return {"deleted": True, "patient_id": patient_id}


# ─────────────────────────────────────────────────────────────────────────────
# APPOINTMENTS CRUD
# ─────────────────────────────────────────────────────────────────────────────

class AppointmentCreate(BaseModel):
    patient_id:        int
    collection_date:   date
    time_slot:         str
    phone_number:      Optional[str] = None
    status:            str = "pending"


class AppointmentUpdate(BaseModel):
    collection_date:   Optional[date] = None
    time_slot:         Optional[str] = None
    status:            Optional[str] = None
    phone_number:      Optional[str] = None
    express_code:      Optional[str] = None


def _appt_out(a: Appointment) -> dict:
    return {
        "appointment_id":      a.appointment_id,
        "patient_id":          a.patient_id,
        "collection_date":     str(a.collection_date),
        "time_slot":           a.time_slot,
        "status":              a.status,
        "express_code":        a.express_code,
        "distribution_channel": a.distribution_channel,
        "phone_number":        a.phone_number,
    }


@router.get("/appointments", dependencies=[Depends(allow_admin)])
def list_appointments(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    stmt = select(Appointment)
    if status_filter:
        stmt = stmt.where(Appointment.status == status_filter)
    stmt = stmt.order_by(Appointment.collection_date.desc()).offset(skip).limit(limit)
    rows = db.execute(stmt).scalars().all()
    return {"count": len(rows), "appointments": [_appt_out(a) for a in rows]}


@router.get("/appointments/{appointment_id}", dependencies=[Depends(allow_admin)])
def get_appointment(appointment_id: int, db: Session = Depends(get_db)):
    a = db.get(Appointment, appointment_id)
    if not a:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    return _appt_out(a)


@router.post("/appointments", status_code=status.HTTP_201_CREATED, dependencies=[Depends(allow_admin)])
def create_appointment(body: AppointmentCreate, db: Session = Depends(get_db)):
    # Verify patient exists
    p = db.get(Patient, body.patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found.")

    phone_hash = hash_phone(body.phone_number) if body.phone_number else None

    a = Appointment(
        patient_id=body.patient_id,
        collection_date=body.collection_date,
        time_slot=body.time_slot,
        status=body.status,
        phone_number=body.phone_number or p.phone_number,
        phone_number_hash=phone_hash or (hash_phone(p.phone_number) if p.phone_number else None),
    )
    db.add(a)
    db.commit()
    db.refresh(a)
    return _appt_out(a)


@router.patch("/appointments/{appointment_id}", dependencies=[Depends(allow_admin)])
def update_appointment(appointment_id: int, body: AppointmentUpdate, db: Session = Depends(get_db)):
    a = db.get(Appointment, appointment_id)
    if not a:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    updates = body.model_dump(exclude_unset=True)

    # If phone number is being updated, also update the hash
    if "phone_number" in updates and updates["phone_number"]:
        a.phone_number_hash = hash_phone(updates["phone_number"])

    for field, value in updates.items():
        setattr(a, field, value)

    db.commit()
    db.refresh(a)
    return _appt_out(a)


@router.delete("/appointments/{appointment_id}", dependencies=[Depends(allow_admin)])
def delete_appointment(appointment_id: int, db: Session = Depends(get_db)):
    a = db.get(Appointment, appointment_id)
    if not a:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    db.delete(a)
    db.commit()
    return {"deleted": True, "appointment_id": appointment_id}


# ─────────────────────────────────────────────────────────────────────────────
# CLINICS CRUD
# ─────────────────────────────────────────────────────────────────────────────

class ClinicCreate(BaseModel):
    clinic_name:    str
    facility_code:  str
    location:       str
    province:       str


class ClinicUpdate(BaseModel):
    clinic_name:    Optional[str] = None
    facility_code:  Optional[str] = None
    location:       Optional[str] = None
    province:       Optional[str] = None


def _clinic_out(c: Clinic) -> dict:
    return {
        "clinic_id":     c.clinic_id,
        "clinic_name":   c.clinic_name,
        "facility_code": c.facility_code,
        "location":      c.location,
        "province":      c.province,
        "created_at":    str(c.created_at) if c.created_at else None,
    }


@router.get("/clinics", dependencies=[Depends(allow_admin)])
def list_clinics(db: Session = Depends(get_db)):
    rows = db.execute(select(Clinic)).scalars().all()
    return {"count": len(rows), "clinics": [_clinic_out(c) for c in rows]}


@router.post("/clinics", status_code=status.HTTP_201_CREATED, dependencies=[Depends(allow_admin)])
def create_clinic(body: ClinicCreate, db: Session = Depends(get_db)):
    existing = db.execute(select(Clinic).where(Clinic.facility_code == body.facility_code)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="A clinic with this facility code already exists.")

    c = Clinic(
        clinic_name=body.clinic_name,
        facility_code=body.facility_code,
        location=body.location,
        province=body.province,
        created_at=datetime.now(timezone.utc),
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return _clinic_out(c)


@router.patch("/clinics/{clinic_id}", dependencies=[Depends(allow_admin)])
def update_clinic(clinic_id: int, body: ClinicUpdate, db: Session = Depends(get_db)):
    c = db.get(Clinic, clinic_id)
    if not c:
        raise HTTPException(status_code=404, detail="Clinic not found.")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(c, field, value)
    db.commit()
    db.refresh(c)
    return _clinic_out(c)


@router.delete("/clinics/{clinic_id}", dependencies=[Depends(allow_admin)])
def delete_clinic(clinic_id: int, db: Session = Depends(get_db)):
    c = db.get(Clinic, clinic_id)
    if not c:
        raise HTTPException(status_code=404, detail="Clinic not found.")
    db.delete(c)
    db.commit()
    return {"deleted": True, "clinic_id": clinic_id}