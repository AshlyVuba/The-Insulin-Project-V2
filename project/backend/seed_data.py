"""
seed_data.py — Inserts two dummy patients and appointments 2 days from today.

Run from inside the backend/ directory:
    cd backend
    python seed_data.py
"""
from dotenv import load_dotenv
load_dotenv(dotenv_path=".env")

from datetime import date, datetime, timezone, timedelta
from app.core.database import SessionLocal
from app.core.encryption import hash_phone
from app.models.clinic import Clinic
from app.models.patient import Patient
from app.models.appointment import Appointment, AppointmentStatus
from app.models.medication_script import MedicationScript

db = SessionLocal()

try:
    # ── 1. Ensure a clinic exists (FK requirement) ────────────────────────────
    clinic = db.query(Clinic).filter_by(clinic_id=1).first()
    if not clinic:
        clinic = Clinic(
            clinic_id=1,
            clinic_name="Tshwane Clinic 1",
            facility_code="TSH-001",
            location="Pretoria CBD, Gauteng",
            province="Gauteng",
            created_at=datetime.now(timezone.utc),
        )
        db.add(clinic)
        db.commit()
        print("✅ Clinic created")
    else:
        print("ℹ️  Clinic already exists")

    collection_date = date.today() + timedelta(days=2)

    # ── Patient 1 — Thabo Nkosi, 0731899869 ──────────────────────────────────
    phone1     = "+27731899869"
    phone1_hash = hash_phone(phone1)

    p1 = db.query(Patient).filter_by(national_id="8204155009087").first()
    if not p1:
        p1 = Patient(
            clinic_id=1,
            national_id="8204155009087",
            facility_patient_number="FRE-00001",
            first_name="Thabo",
            last_name="Nkosi",
            phone_number=phone1,
            tracking_status="active",
            date_of_birth=date(1982, 4, 15),
            gender="Male",
            created_at=datetime.now(timezone.utc),
        )
        db.add(p1)
        db.commit()
        db.refresh(p1)
        print(f"✅ Patient 1 created: Thabo Nkosi (ID: {p1.patient_id})")
    else:
        print(f"ℹ️  Patient 1 already exists (ID: {p1.patient_id})")

    # Script for patient 1
    s1 = MedicationScript(
        patient_id=p1.patient_id,
        drug_name="Long-Acting (e.g. Lantus, Levemir, Toujeo)",
        dosage="20 units once daily at bedtime",
        issue_date=date.today(),
        valid_months=1,
        created_at=datetime.now(timezone.utc),
    )
    db.add(s1)

    # Appointment for patient 1
    a1 = db.query(Appointment).filter_by(patient_id=p1.patient_id).first()
    if not a1:
        a1 = Appointment(
            patient_id=p1.patient_id,
            collection_date=collection_date,
            time_slot="08:30-09:30",
            status=AppointmentStatus.pending,
            phone_number=phone1,
            phone_number_hash=phone1_hash,
        )
        db.add(a1)
        db.commit()
        db.refresh(a1)
        print(f"✅ Appointment 1 created for {collection_date} at 08:30-09:30 (ID: {a1.appointment_id})")
    else:
        print(f"ℹ️  Appointment 1 already exists (ID: {a1.appointment_id})")

    # ── Patient 2 — Nomsa Dlamini, 0833623500 ────────────────────────────────
    phone2      = "+27833623500"
    phone2_hash = hash_phone(phone2)

    p2 = db.query(Patient).filter_by(national_id="9507200089083").first()
    if not p2:
        p2 = Patient(
            clinic_id=1,
            national_id="9507200089083",
            facility_patient_number="FRE-00002",
            first_name="Nomsa",
            last_name="Dlamini",
            phone_number=phone2,
            tracking_status="active",
            date_of_birth=date(1995, 7, 20),
            gender="Female",
            created_at=datetime.now(timezone.utc),
        )
        db.add(p2)
        db.commit()
        db.refresh(p2)
        print(f"✅ Patient 2 created: Nomsa Dlamini (ID: {p2.patient_id})")
    else:
        print(f"ℹ️  Patient 2 already exists (ID: {p2.patient_id})")

    # Script for patient 2
    s2 = MedicationScript(
        patient_id=p2.patient_id,
        drug_name="Rapid-Acting (e.g. NovoRapid, Humalog)",
        dosage="10 units with each meal, 3x daily",
        issue_date=date.today(),
        valid_months=1,
        created_at=datetime.now(timezone.utc),
    )
    db.add(s2)

    # Appointment for patient 2
    a2 = db.query(Appointment).filter_by(patient_id=p2.patient_id).first()
    if not a2:
        a2 = Appointment(
            patient_id=p2.patient_id,
            collection_date=collection_date,
            time_slot="10:30-11:30",
            status=AppointmentStatus.pending,
            phone_number=phone2,
            phone_number_hash=phone2_hash,
        )
        db.add(a2)
        db.commit()
        db.refresh(a2)
        print(f"✅ Appointment 2 created for {collection_date} at 10:30-11:30 (ID: {a2.appointment_id})")
    else:
        print(f"ℹ️  Appointment 2 already exists (ID: {a2.appointment_id})")

    db.commit()
    print(f"\n🎉 Seed complete! Both appointments set for {collection_date}.")
    print(f"   Thabo Nkosi     → +27731899869 → 08:30-09:30")
    print(f"   Nomsa Dlamini   → +27833623500 → 10:30-11:30")
    print(f"\n   Status: pending — text '1' to confirm, '2' to cancel.")

except Exception as e:
    db.rollback()
    print(f"❌ Error: {e}")
    raise
finally:
    db.close()