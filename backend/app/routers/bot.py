import os
from fastapi import APIRouter, Depends, Request, Response, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from twilio.twiml.messaging_response import MessagingResponse
from twilio.request_validator import RequestValidator

from app.core.database import get_db
# Note: Tshepang L. needs to ensure the Appointment model has a 'patient_phone' field!
from app.models.appointment import Appointment, AppointmentStatus

router = APIRouter(prefix="/bot", tags=["WhatsApp Bot Webhook"])

# OWASP A01 Defense: Validate that the request is ACTUALLY coming from Twilio
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
validator = RequestValidator(TWILIO_AUTH_TOKEN)

@router.post("/whatsapp")
async def twilio_whatsapp_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Twilio hits this endpoint when a patient replies to the WhatsApp bot.
    Example: Patient replies "1" to confirm their appointment.
    """
    # 1. SECURITY: Validate the Twilio Signature
    # This prevents hackers from spoofing requests to your webhook
    form_data = await request.form()
    url = str(request.url)
    signature = request.headers.get("X-Twilio-Signature", "")

    if not validator.validate(url, form_data, signature):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Invalid Twilio Signature. Access Denied."
        )

    # 2. Extract Data from Twilio's Payload
    sender_phone = form_data.get("From", "") # Looks like: "whatsapp:+27821234567"
    incoming_msg = form_data.get("Body", "").strip().lower()

    # Create the Twilio XML Response object
    resp = MessagingResponse()

    # 3. Handle the Conversation Logic
    if incoming_msg == "1":
        # The patient is confirming their appointment!
        # Find their pending appointment in the database based on their phone number
        
        stmt = select(Appointment).where(
            # Strip "whatsapp:" prefix if necessary depending on how you store phones
            Appointment.patient_phone == sender_phone.replace("whatsapp:", ""),
            Appointment.status == AppointmentStatus.pending # Assuming 'pending' means awaiting confirmation
        )
        appointment = db.execute(stmt).scalar_one_or_none()

        if appointment:
            # Update status to 'confirmed' so the Filing Room sees it in 3 days
            appointment.status = AppointmentStatus.confirmed
            db.commit()
            
            # Generate the JIT Express Code (e.g., INS-7734)
            express_code = f"INS-{appointment.id * 11}" 
            
            resp.message(
                f"✅ Appointment Confirmed!\n\n"
                f"Your fast-track code is *{express_code}*.\n"
                f"Please show this code to the pharmacist on {appointment.collection_date}.\n\n"
                f"See you soon, First Response Express."
            )
        else:
            resp.message("We couldn't find a pending appointment for this number. Please contact the clinic.")

    elif incoming_msg == "2":
        resp.message("You have cancelled your appointment. A nurse will contact you to reschedule.")
        # Add logic here to update DB status to 'cancelled'

    else:
        # Default fallback message
        resp.message(
            "Welcome to First Response Express! 🏥\n\n"
            "To confirm your upcoming medication collection, reply *1*.\n"
            "To cancel or reschedule, reply *2*."
        )

    # Twilio expects an XML response, not JSON!
    return Response(content=str(resp), media_type="application/xml")