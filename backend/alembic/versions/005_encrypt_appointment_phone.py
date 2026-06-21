"""encrypt appointment phone_number, add phone_number_hash

Revision ID: 005_encrypt_appointment_phone
Revises: 004_encrypt_patient_pii
Create Date: 2026-06-20

Two changes to the appointments table to support searchable encrypted PII:

1. phone_number : String(30) → String(500)
   Widens the column to hold Fernet ciphertext. The bot still writes the
   patient's E.164 number here, but now it's encrypted at rest.

2. phone_number_hash : String(64), indexed (new column)
   A keyed HMAC-SHA256 digest of the phone number, used for WHERE clause
   lookups. Fernet produces different ciphertext on every encrypt call, so
   the encrypted column can't be queried directly — the hash solves this.
   64 chars = SHA-256 hex digest length exactly.

   The old ix_appointments_phone_number index (on plaintext phone_number) is
   dropped — it's meaningless once the column holds ciphertext.

IMPORTANT — data migration:
  Existing rows need phone_number_hash populated. After applying this migration,
  run:

      python3 backend/scripts/encrypt_existing_appointments.py

  For a fresh hackathon DB with no rows, just apply and you're done.
"""
from alembic import op
import sqlalchemy as sa

revision = "005_encrypt_appointment_phone"
down_revision = "004_encrypt_patient_pii"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Drop the old plaintext index — ciphertext values can't be usefully indexed
    op.drop_index("ix_appointments_phone_number", table_name="appointments")

    # 2. Widen phone_number to hold Fernet ciphertext
    op.alter_column(
        "appointments", "phone_number",
        existing_type=sa.String(30),
        type_=sa.String(500),
        nullable=True,
    )

    # 3. Add the hash column for lookups
    op.add_column(
        "appointments",
        sa.Column("phone_number_hash", sa.String(64), nullable=True),
    )

    # 4. Index the hash column — this is what the bot's WHERE clause queries
    op.create_index(
        "ix_appointments_phone_number_hash",
        "appointments",
        ["phone_number_hash"],
    )


def downgrade() -> None:
    op.drop_index("ix_appointments_phone_number_hash", table_name="appointments")
    op.drop_column("appointments", "phone_number_hash")
    op.alter_column(
        "appointments", "phone_number",
        existing_type=sa.String(500),
        type_=sa.String(30),
        nullable=True,
    )
    op.create_index("ix_appointments_phone_number", "appointments", ["phone_number"])
