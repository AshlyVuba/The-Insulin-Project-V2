"""encrypt patient PII fields

Revision ID: 004_encrypt_patient_pii
Revises: 0001_full_schema
Create Date: 2026-06-20

Widens the three PII columns on the patients table to accommodate Fernet
ciphertext, which is significantly longer than the original plaintext values.

  first_name   : String(100)  → String(500)
  last_name    : String(100)  → String(500)
  phone_number : String(20)   → String(500)

Fernet encrypts to base64-encoded ciphertext — a 20-character phone number
produces ~100 characters of ciphertext, so String(500) is a safe ceiling.

IMPORTANT — data migration:
  Existing rows have plaintext values in these columns. After applying this
  migration, run the data migration script to re-encrypt them:

      python3 backend/scripts/encrypt_existing_patients.py

  Until that script runs, the app will try to decrypt existing plaintext values
  and raise errors. For a fresh hackathon DB with no real data, just apply the
  migration and you're done.
"""
from alembic import op
import sqlalchemy as sa

revision = "004_encrypt_patient_pii"
down_revision = '003_add_collected_status'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Widen columns to hold Fernet ciphertext.
    # existing_type is required by some backends (PostgreSQL) for ALTER COLUMN.
    op.alter_column(
        "patients", "first_name",
        existing_type=sa.String(100),
        type_=sa.String(500),
        nullable=False,
    )
    op.alter_column(
        "patients", "last_name",
        existing_type=sa.String(100),
        type_=sa.String(500),
        nullable=False,
    )
    op.alter_column(
        "patients", "phone_number",
        existing_type=sa.String(20),
        type_=sa.String(500),
        nullable=True,
    )


def downgrade() -> None:
    # Narrowing back will TRUNCATE ciphertext — only safe on a fresh DB.
    # On a DB with real encrypted data, downgrade manually after decrypting.
    op.alter_column(
        "patients", "phone_number",
        existing_type=sa.String(500),
        type_=sa.String(20),
        nullable=True,
    )
    op.alter_column(
        "patients", "last_name",
        existing_type=sa.String(500),
        type_=sa.String(100),
        nullable=False,
    )
    op.alter_column(
        "patients", "first_name",
        existing_type=sa.String(500),
        type_=sa.String(100),
        nullable=False,
    )
