from sqlalchemy import Column, Integer, String, Date, Time, Enum as PgEnum
from app.models.base import Base
import enum


class AppointmentStatus(str, enum.Enum):
    confirmed  = "confirmed"
    pulled     = "pulled"
    dispensed  = "dispensed"
    cancelled  = "cancelled"


class Appointment(Base):
    """
    Represents a patient's scheduled chronic medication collection slot.

    status lifecycle:
        confirmed → pulled → dispensed
    The filing clerk endpoint only surfaces 'confirmed' records
    that are exactly 3 days away, explicitly excluding 'pulled'
    and 'dispensed' to prevent duplicate admin processing.
    """
    __tablename__ = "appointments"

    id            = Column(Integer,   primary_key=True, index=True)
    patient_name  = Column(String(120), nullable=False)
    folder_number = Column(String(20),  nullable=False, unique=True, index=True)
    collection_date = Column(Date,      nullable=False, index=True)
    time_slot     = Column(String(20),  nullable=False)   # e.g. "08:00 – 09:00"
    status        = Column(
        PgEnum(AppointmentStatus, name="appointment_status"),
        nullable=False,
        default=AppointmentStatus.confirmed,
        index=True,
    )
