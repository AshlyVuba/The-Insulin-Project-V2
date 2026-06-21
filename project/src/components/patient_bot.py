import os
import random
import string
import httpx
from fastapi import FastAPI, Form, Response
from twilio.twiml.messaging_response import MessagingResponse

app = FastAPI(title="First Response Express - Sandbox Webhook")

# Shared backend location (Configurable via environment variable)
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:8000/api/v1")

def generate_express_code() -> str:
    """
    Generates a clear 4-character alphanumeric Express Code.
    Excludes easily confused characters (0, O, 1, I) for clinic reliability.
    """
    allowed_chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
    code = ''.join(random.choices(allowed_chars, k=4))
    return f"INS-{code}"

@app.post("/webhook/sms")
async def inbound_sms_whatsapp(
    From: str = Form(...), 
    Body: str = Form(...)
):
    """
    Strict, menu-driven communication workflow for low-end device predictability.
    Accepts incoming URL-encoded form data directly from the Twilio Sandbox.
    """
    # 1. Normalize and clean the incoming input to keep evaluation rigid
    user_input = Body.strip()
    twiml_response = MessagingResponse()
    
    # Extract channel information from Twilio format
    is_whatsapp = From.startswith("whatsapp:")
    clean_phone = From.replace("whatsapp:", "") if is_whatsapp else From
    channel_type = "WhatsApp" if is_whatsapp else "SMS"

    # 2. Strict Deterministic Routing Matrix (No NLP/Free-text allowed)
    if user_input == "1":
        # Action: Process Slot Confirmation
        express_code = generate_express_code()
        
        try:
            async with httpx.AsyncClient() as client:
                await client.patch(
                    f"{BACKEND_API_URL}/appointments/confirm",
                    json={
                        "phone_number": clean_phone,
                        "express_code": express_code,
                        "distribution_channel": channel_type
                    },
                    timeout=2.0
                )
        except httpx.HTTPError:
            pass  # Fallback gracefully if Tshepang's local API port is not actively running yet

        msg = twiml_response.message()
        msg.body(
            f"Thank you for confirming via {channel_type}.\n\n"
            f"Your Fast-Track Express Code is: {express_code}\n"
            f"Present this code at the clinic window to collect your pre-packed workflow files."
        )

    elif user_input == "2":
        # Action: Process Opt-Out/Reschedule State
        try:
            async with httpx.AsyncClient() as client:
                await client.patch(
                    f"{BACKEND_API_URL}/appointments/opt-out",
                    json={"phone_number": clean_phone},
                    timeout=2.0
                )
        except httpx.HTTPError:
            pass

        msg = twiml_response.message()
        msg.body(
            "Understood. Your files will not be pre-packed.\n\n"
            "Please visit your public clinic manually or consult your community health worker to reschedule."
        )

    else:
        # Action: Standardized Menu Fallback for any invalid inputs
        msg = twiml_response.message()
        msg.body(
            f"First Response Express [{channel_type} Portal]\n\n"
            f"Reply '1' to CONFIRM your upcoming insulin collection slot.\n"
            f"Reply '2' to CANCEL/RESCHEDULE."
        )

    # 3. Return verified response payload back to the device
    return Response(content=str(twiml_response), media_type="application/xml")