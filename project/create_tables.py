from dotenv import load_dotenv
load_dotenv(dotenv_path='.env')

from app.core.database import engine
from app.models.base import Base
from app.models.clinic import Clinic
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.medication_script import MedicationScript
from app.models.queue import Queue

print('Creating all tables...')
Base.metadata.create_all(bind=engine)
print('Done! Tables:')
for t in Base.metadata.sorted_tables:
    print(f'  - {t.name}')
