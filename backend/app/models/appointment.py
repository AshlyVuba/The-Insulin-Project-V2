from datetime import datetime, timezone
import enum


from sqlalchemy import (
    Integer,
    Date,
    String,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column
)

from app.models.base import Base


class AppointmentStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"
    pulled = "pulled"
    dispensed = "dispensed"
class Appointment(Base):
    __tablename__ = "appointments"

    appointment_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    patient_id: Mapped[int] = mapped_column(
        ForeignKey("patients.patient_id"),
        nullable=False
    )

    baseline_date: Mapped[Date] = mapped_column(
        Date,
        nullable=False
    )

    collection_window: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )