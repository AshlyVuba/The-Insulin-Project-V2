from sqlalchemy import String, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base

from datetime import datetime, timezone


class Clinic(Base):
    __tablename__ = "clinics"

    clinic_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    clinic_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    facility_code: Mapped[str] = mapped_column(
        String(30),
        unique=True
    )

    location: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    province: Mapped[str] = mapped_column(
        String(50)
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc) 
    )