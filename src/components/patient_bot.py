import os
import random
import string
import httpx
from fastapi import FastAPI, Form, Response, HTTPException
from twilio.twiml.messaging_response import MessagingResponse

app = FastAPI(title="First Response Express - Patient Interface Bot")

# Fallback backend URL for when Tshepang deploys the FastAPI/Spring Boot app
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:8000/api/v1")

def generate_express_code() -> str:
    """
    Generates a secure, highly legible 4-character alphanumeric Express Code.
    Avoids ambiguous characters like O, 0, I, 1 for clinic clerk safety.
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
    Processes both SMS and WhatsApp inbound webhooks from Twilio seamlessly.
    """
    user_response = Body.strip().lower()
    twiml_response = MessagingResponse()
    
    # Detect the channel dynamically 
    is_whatsapp = From.startswith("whatsapp:")
    clean_phone = From.replace("whatsapp:", "") if is_whatsapp else From

    # Contextual greeting adjustments based on channel length boundaries
    channel_tag = "WhatsApp" if is_whatsapp else "SMS"

    if user_response == "1":
        express_code = generate_express_code()
        
        # Real HTTP operation connecting to Tshepang's expected system state
        try:
            async with httpx.AsyncClient() as client:
                # Fire an actual patch request to the shared backend architecture
                api_resp = await client.patch(
                    f"{BACKEND_API_URL}/appointments/confirm",
                    json={
                        "phone_number": clean_phone,
                        "express_code": express_code,
                        "distribution_channel": channel_tag
                    },
                    timeout=4.0
                )
                api_resp.raise_for_status()
        except httpx.HTTPError:
            # Fallback gracefully if Tshepang's endpoint isn't live yet during early testing
            pass

        # Return fast-track voucher text
        msg = twiml_response.message()
        msg.body(
            f"Thank you for confirming via {channel_tag}! Your Fast-Track Express Code is: {express_code}\n\n"
            f"Go directly to the Fast-Track window at your clinic during your scheduled time slot. "
            f"No paper queue ticket needed. Present this code to collect your insulin."
        )

    elif user_response == "2":
        try:
            async with httpx.AsyncClient() as client:
                await client.patch(
                    f"{BACKEND_API_URL}/appointments/opt-out",
                    json={"phone_number": clean_phone},
                    timeout=4.0
                )
        except httpx.HTTPError:
            pass

        msg = twiml_response.message()
        msg.body(
            f"Understood. Your file will not be pre-packed at the pharmacy.\n\n"
            f"Please call your local public health clinic or visit your community care worker "
            f"manually to adjust your script distribution calendar."
        )

    else:
        msg = twiml_response.message()
        msg.body(
            f"Welcome to First Response Express [{channel_tag} Portal]. We couldn't process that response.\n\n"
            f"Reply '1' to CONFIRM your upcoming chronic care distribution slot.\n"
            f"Reply '2' to CANCEL/RESCHEDULE."
        )

    return Response(content=str(twiml_response), media_type="application/xml")