from app.core.database import engine
from app.models.base import Base

# Import models so SQLAlchemy knows about them
from app.models.clinic import Clinic
from app.models.patient import Patient

Base.metadata.create_all(bind=engine)

print("✓ Tables created successfully")