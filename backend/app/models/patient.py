from datetime import datetime, timezone

from sqlalchemy import (
    String,
    Integer,
    Date,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship
)

from app.models.base import Base
from app.core.encryption import EncryptedString


class Patient(Base):
    __tablename__ = "patients"

    patient_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    clinic_id: Mapped[int] = mapped_column(
        ForeignKey("clinics.clinic_id")
    )

    # Identifiers — not encrypted (needed for indexed lookups)
    national_id: Mapped[str] = mapped_column(
        String(20),
        unique=True
    )

    facility_patient_number: Mapped[str] = mapped_column(
        String(30),
        unique=True
    )

    # PII fields — encrypted at rest for POPIA compliance
    first_name: Mapped[str] = mapped_column(
        EncryptedString(255),
        nullable=False
    )

    last_name: Mapped[str] = mapped_column(
        EncryptedString(255),
        nullable=False
    )

    phone_number: Mapped[str] = mapped_column(
        EncryptedString(100)
    )

    tracking_status: Mapped[str] = mapped_column(
        String(20),
        default="active"
    )

    date_of_birth: Mapped[Date] = mapped_column(
        Date,
        nullable=True
    )

    gender: Mapped[str] = mapped_column(
        String(20),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )
