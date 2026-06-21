from datetime import datetime, timezone

from sqlalchemy import (
    Integer,
    String,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column
)

from app.models.base import Base


class Queue(Base):
    __tablename__ = "queues"

    queue_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    appointment_id: Mapped[int] = mapped_column(
        ForeignKey("appointments.appointment_id"),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    express_code: Mapped[str] = mapped_column(
        String(30),
        unique=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )