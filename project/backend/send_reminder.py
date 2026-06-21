"""
send_reminders.py — Sends appointment reminder SMS/WhatsApp to patients
whose collection date is exactly 3 days from today.

Fill in your Twilio credentials below, then run from backend/:
    python send_reminders.py

Can also be run as a daily cron job / Windows Task Scheduler task.
"""
from dotenv import load_dotenv
load_dotenv(dotenv_path=".env")

import os
from datetime import date, timedelta
from twilio.rest import Client
from app.core.database import SessionLocal
from app.models.appointment import Appointment, AppointmentStatus

# ── FILL THESE IN ─────────────────────────────────────────────────────────────
TWILIO_ACCOUNT_SID  = "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"  # Your Account SID
TWILIO_AUTH_TOKEN   = os.getenv("TWILIO_AUTH_TOKEN")        # Loaded from .env
TWILIO_FROM_NUMBER  = "+14155238886"                        # Your Twilio number
# ─────────────────────────────────────────────────────────────────────────────

# Set to True if you're using WhatsApp sandbox, False for regular SMS
USE_WHATSAPP = True

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
db     = SessionLocal()

def format_number(phone: str, whatsapp: bool) -> str:
    """Adds whatsapp: prefix if needed."""
    # Normalise: strip leading 0, add +27 for SA numbers
    if phone.startswith("0"):
        phone = "+27" + phone[1:]
    return f"whatsapp:{phone}" if whatsapp else phone

def format_from(number: str, whatsapp: bool) -> str:
    return f"whatsapp:{number}" if whatsapp else number

try:
    target_date = date.today() + timedelta(days=3)
    print(f"Looking for appointments on {target_date}...\n")

    appointments = (
        db.query(Appointment)
        .filter(
            Appointment.collection_date == target_date,
            Appointment.status == AppointmentStatus.pending,
        )
        .all()
    )

    if not appointments:
        print("No pending appointments found 3 days from today.")
    else:
        print(f"Found {len(appointments)} appointment(s) to notify:\n")

        for appt in appointments:
            # Decrypt phone number (EncryptedString handles this automatically)
            raw_phone = appt.phone_number

            if not raw_phone:
                print(f"  ⚠️  Appointment #{appt.appointment_id} has no phone number — skipping.")
                continue

            to_number   = format_number(raw_phone, USE_WHATSAPP)
            from_number = format_from(TWILIO_FROM_NUMBER, USE_WHATSAPP)

            message_body = (
                f"Hello! 👋 This is First Response Express.\n\n"
                f"Your insulin collection is scheduled for "
                f"*{appt.collection_date.strftime('%A, %d %B %Y')}* "
                f"at *{appt.time_slot}*.\n\n"
                f"Reply *1* to CONFIRM your slot.\n"
                f"Reply *2* to CANCEL or reschedule.\n\n"
                f"First Response Express — Tshwane Clinic"
            )

            try:
                msg = client.messages.create(
                    body=message_body,
                    from_=from_number,
                    to=to_number,
                )
                print(f"  ✅ SMS sent to {raw_phone} — SID: {msg.sid}")

                # Mark as 'confirmed' status stays pending until patient replies,
                # but we log that the notification was sent
                print(f"     Appointment #{appt.appointment_id} | {appt.collection_date} | {appt.time_slot}")

            except Exception as e:
                print(f"  ❌ Failed to send to {raw_phone}: {e}")

    print("\nDone.")

except Exception as e:
    print(f"❌ Script error: {e}")
    raise
finally:
    db.close()