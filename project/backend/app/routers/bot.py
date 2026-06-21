import os
from fastapi import APIRouter, Depends, Request, Response, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from twilio.twiml.messaging_response import MessagingResponse
from twilio.request_validator import RequestValidator

from app.core.database import get_db
from app.models.appointment import Appointment, AppointmentStatus
from app.core.encryption import hash_phone
from project.backend.conversational_bot.code_generator import generate_fast_track_code

router = APIRouter(prefix="/bot", tags=["WhatsApp Bot Webhook"])

TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
validator = RequestValidator(TWILIO_AUTH_TOKEN)


@router.post("/whatsapp")
async def twilio_whatsapp_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Twilio hits this endpoint when a patient replies to the WhatsApp/SMS bot.
    Reply "1" to confirm, "2" to cancel.
    """
    form_data = await request.form()
    url        = str(request.url)
    signature  = request.headers.get("X-Twilio-Signature", "")

    # OWASP A01: Validate the request is actually from Twilio
    if not validator.validate(url, form_data, signature):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid Twilio Signature. Access Denied.",
        )

    sender_phone = form_data.get("From", "")   # "whatsapp:+27821234567"
    incoming_msg = form_data.get("Body", "").strip().lower()
    clean_phone  = sender_phone.replace("whatsapp:", "")

    resp = MessagingResponse()

    if incoming_msg == "1":
        # ── Patient is CONFIRMING their appointment ──────────────────────────
        stmt = (
            select(Appointment)
            .where(
                Appointment.phone_number_hash == hash_phone(clean_phone),
                Appointment.status == AppointmentStatus.pending,
            )
            .order_by(Appointment.collection_date)
            .limit(1)
        )
        appointment = db.execute(stmt).scalar_one_or_none()

        if appointment:
            # Advance status: pending → confirmed
            appointment.status = AppointmentStatus.confirmed

            # Generate express code and SAVE it to the database
            express_code = generate_fast_track_code()
            appointment.express_code = express_code
            appointment.distribution_channel = (
                "WhatsApp" if sender_phone.startswith("whatsapp:") else "SMS"
            )
            db.commit()

            resp.message(
                f"✅ Appointment Confirmed!\n\n"
                f"Your fast-track code is *{express_code}*.\n"
                f"Please show this code to the pharmacist on {appointment.collection_date}.\n\n"
                f"See you soon — First Response Express."
            )
        else:
            resp.message(
                "We couldn't find a pending appointment for this number. "
                "Please contact the clinic."
            )

    elif incoming_msg == "2":
        # ── Patient is CANCELLING ────────────────────────────────────────────
        stmt = (
            select(Appointment)
            .where(
                Appointment.phone_number_hash == hash_phone(clean_phone),
                Appointment.status.in_([
                    AppointmentStatus.pending,
                    AppointmentStatus.confirmed,
                ]),
            )
            .order_by(Appointment.collection_date)
            .limit(1)
        )
        appointment = db.execute(stmt).scalar_one_or_none()

        if appointment:
            appointment.status = AppointmentStatus.cancelled
            db.commit()

        resp.message(
            "You have cancelled your appointment. "
            "A nurse will contact you to reschedule."
        )

    else:
        resp.message(
            "Welcome to First Response Express! 🏥\n\n"
            "To confirm your upcoming medication collection, reply *1*.\n"
            "To cancel or reschedule, reply *2*."
        )

    return Response(content=str(resp), media_type="application/xml")