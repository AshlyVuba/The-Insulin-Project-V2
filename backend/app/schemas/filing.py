from pydantic import BaseModel, Field
from datetime import date


class FilingAppointmentOut(BaseModel):
    """
    Shape of each record returned to the filing clerk UI.
    Exactly the three fields the frontend needs:
      - patient_name
      - folder_number
      - time_slot
    Plus id and collection_date for client-side keying.
    """
    id:              int
    patient_name:    str  = Field(..., examples=["Nomsa Dlamini"])
    folder_number:   str  = Field(..., examples=["FRE-0041"])
    collection_date: date = Field(..., examples=["2026-06-23"])
    time_slot:       str  = Field(..., examples=["08:00 – 09:00"])

    model_config = {"from_attributes": True}


class FilingAppointmentsResponse(BaseModel):
    """Top-level envelope for the filing clerk list endpoint."""
    count:        int
    appointments: list[FilingAppointmentOut]
