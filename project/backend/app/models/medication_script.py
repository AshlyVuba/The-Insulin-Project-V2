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
    mapped_column
)

from app.models.base import Base


class MedicationScript(Base):
    __tablename__ = "medication_scripts"

    script_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    patient_id: Mapped[int] = mapped_column(
        ForeignKey("patients.patient_id"),
        nullable=False
    )

    drug_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    dosage: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    issue_date: Mapped[Date] = mapped_column(
        Date,
        nullable=False
    )

    valid_months: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )