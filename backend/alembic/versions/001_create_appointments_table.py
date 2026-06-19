"""create appointments table

Revision ID: 001_appointments
Revises:
Create Date: 2026-06-20
"""
from alembic import op
import sqlalchemy as sa

revision = "001_appointments"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create the enum type first
    appointment_status = sa.Enum(
        "confirmed", "pulled", "dispensed", "cancelled",
        name="appointment_status"
    )
    appointment_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "appointments",
        sa.Column("id",              sa.Integer(),    primary_key=True, index=True),
        sa.Column("patient_name",    sa.String(120),  nullable=False),
        sa.Column("folder_number",   sa.String(20),   nullable=False, unique=True),
        sa.Column("collection_date", sa.Date(),       nullable=False),
        sa.Column("time_slot",       sa.String(20),   nullable=False),
        sa.Column(
            "status",
            sa.Enum("confirmed", "pulled", "dispensed", "cancelled",
                    name="appointment_status"),
            nullable=False,
            server_default="confirmed",
        ),
    )

    op.create_index("ix_appointments_collection_date", "appointments", ["collection_date"])
    op.create_index("ix_appointments_status",          "appointments", ["status"])
    op.create_index("ix_appointments_folder_number",   "appointments", ["folder_number"])


def downgrade() -> None:
    op.drop_table("appointments")
    sa.Enum(name="appointment_status").drop(op.get_bind(), checkfirst=True)
