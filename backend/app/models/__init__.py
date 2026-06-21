# Register ALL models with SQLAlchemy metadata so create_all() and Alembic
# can see every table. Missing imports = missing tables at runtime.
from app.models.clinic import Clinic
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.medication_script import MedicationScript
from app.models.queue import Queue