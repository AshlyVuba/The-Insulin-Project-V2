"""add collected value to appointment_status enum

Revision ID: 003_add_collected_status
Revises: 002_patient_contact_fields
Create Date: 2026-06-20

Replaces the date-shifting workaround in pharmacy.py (setting collection_date
to yesterday so cards drop off the today-filtered ready list) with a proper
status transition: dispensed → collected.

PostgreSQL requires ALTER TYPE to add a new enum value. The operation is
non-destructive — existing rows are unaffected.
"""
from alembic import op

revision = "003_add_collected_status"
down_revision = "002_patient_contact_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ADD VALUE is safe on existing data — no rows change, no locks beyond a brief schema lock.
    # IF NOT EXISTS guards against re-running on a DB that already has the value.
    op.execute("ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'collected'")


def downgrade() -> None:
    # PostgreSQL does not support removing enum values natively.
    # To fully revert: recreate the enum without 'collected' and cast the column.
    # For now we raise to prevent accidental partial rollbacks in production.
    raise NotImplementedError(
        "Removing an enum value from PostgreSQL requires manual intervention. "
        "See: https://www.postgresql.org/docs/current/sql-altertype.html"
    )