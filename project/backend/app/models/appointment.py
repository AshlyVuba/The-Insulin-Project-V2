import enum
from datetime import datetime, date
from sqlalchemy import Integer, Date, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base
from app.core.encryption import EncryptedString


class AppointmentStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"
    pulled = "pulled"
    ready = "ready"
    dispensed = "dispensed"
    collected = "collected"


class Appointment(Base):
    __tablename__ = "appointments"

    appointment_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.patient_id"), nullable=False)
    collection_date: Mapped[date] = mapped_column(Date, nullable=False)
    time_slot: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default=AppointmentStatus.pending)

    # Bot fields
    # phone_number is encrypted at rest for POPIA compliance.
    # phone_number_hash is a keyed HMAC-SHA256 digest used for WHERE lookups —
    # queryable without exposing plaintext, not reversible without the key.
    phone_number: Mapped[str] = mapped_column(EncryptedString(255), nullable=True)
    phone_number_hash: Mapped[str] = mapped_column(String(64), nullable=True, index=True)

    express_code: Mapped[str] = mapped_column(String(10), nullable=True)
    distribution_channel: Mapped[str] = mapped_column(String(20), nullable=True)
