"""add patient contact fields to appointments

Revision ID: 002_patient_contact_fields
Revises: 001_appointments
Create Date: 2026-06-20

Adds three nullable columns to support the patient SMS/WhatsApp bot workflow:
  - phone_number         : E.164 number Twilio gives us, used to look up the appointment
  - express_code         : Generated on confirm (e.g. "INS-A3K7"), presented at clinic window
  - distribution_channel : Audit trail — "WhatsApp" or "SMS"

These columns are all nullable because existing appointments won't have them
until a patient texts in.
"""
from alembic import op
import sqlalchemy as sa

revision = "002_patient_contact_fields"
down_revision = '0001_full_schema'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "appointments",
        sa.Column("phone_number", sa.String(30), nullable=True),
    )
    op.add_column(
        "appointments",
        sa.Column("express_code", sa.String(10), nullable=True),
    )
    op.add_column(
        "appointments",
        sa.Column("distribution_channel", sa.String(20), nullable=True),
    )
    # Index phone_number so the bot lookup is fast even at scale
    op.create_index("ix_appointments_phone_number", "appointments", ["phone_number"])


def downgrade() -> None:
    op.drop_index("ix_appointments_phone_number", table_name="appointments")
    op.drop_column("appointments", "distribution_channel")
    op.drop_column("appointments", "express_code")
    op.drop_column("appointments", "phone_number")