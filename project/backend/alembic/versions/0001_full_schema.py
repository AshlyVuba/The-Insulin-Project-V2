"""full schema

Revision ID: 0001_full_schema
Revises:
Create Date: 2026-06-20

Complete schema for First Response Express:
  - clinics
  - patients
  - appointments (with phone_number, express_code, distribution_channel, status)
  - medication_scripts
  - queues
"""
from alembic import op
import sqlalchemy as sa

revision = "0001_full_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── clinics ──────────────────────────────────────────────────────────────
    op.create_table(
        "clinics",
        sa.Column("clinic_id",     sa.Integer(),      nullable=False),
        sa.Column("clinic_name",   sa.String(100),    nullable=False),
        sa.Column("facility_code", sa.String(30),     nullable=False),
        sa.Column("location",      sa.String(255),    nullable=False),
        sa.Column("province",      sa.String(50),     nullable=True),
        sa.Column("created_at",    sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("clinic_id"),
        sa.UniqueConstraint("facility_code"),
    )

    # ── patients ─────────────────────────────────────────────────────────────
    op.create_table(
        "patients",
        sa.Column("patient_id",              sa.Integer(),   nullable=False),
        sa.Column("clinic_id",               sa.Integer(),   nullable=False),
        sa.Column("national_id",             sa.String(20),  nullable=False),
        sa.Column("facility_patient_number", sa.String(30),  nullable=False),
        sa.Column("first_name",              sa.String(100), nullable=False),
        sa.Column("last_name",               sa.String(100), nullable=False),
        sa.Column("phone_number",            sa.String(20),  nullable=True),
        sa.Column("tracking_status",         sa.String(20),  nullable=False, server_default="active"),
        sa.Column("date_of_birth",           sa.Date(),      nullable=True),
        sa.Column("gender",                  sa.String(20),  nullable=True),
        sa.Column("created_at",              sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["clinic_id"], ["clinics.clinic_id"]),
        sa.PrimaryKeyConstraint("patient_id"),
        sa.UniqueConstraint("national_id"),
        sa.UniqueConstraint("facility_patient_number"),
    )

    # ── appointments ─────────────────────────────────────────────────────────
    op.create_table(
        "appointments",
        sa.Column("appointment_id",       sa.Integer(),  nullable=False),
        sa.Column("patient_id",           sa.Integer(),  nullable=False),
        sa.Column("collection_date",      sa.Date(),     nullable=False),
        sa.Column("time_slot",            sa.String(20), nullable=False),
        sa.Column("status",               sa.String(20), nullable=False, server_default="pending"),
        # Bot fields
        sa.Column("phone_number",         sa.String(30), nullable=True),
        sa.Column("express_code",         sa.String(10), nullable=True),
        sa.Column("distribution_channel", sa.String(20), nullable=True),
        sa.ForeignKeyConstraint(["patient_id"], ["patients.patient_id"]),
        sa.PrimaryKeyConstraint("appointment_id"),
    )
    op.create_index("ix_appointments_phone_number", "appointments", ["phone_number"])

    # ── medication_scripts ───────────────────────────────────────────────────
    op.create_table(
        "medication_scripts",
        sa.Column("script_id",    sa.Integer(),   nullable=False),
        sa.Column("patient_id",   sa.Integer(),   nullable=False),
        sa.Column("drug_name",    sa.String(150), nullable=False),
        sa.Column("dosage",       sa.String(100), nullable=False),
        sa.Column("issue_date",   sa.Date(),      nullable=False),
        sa.Column("valid_months", sa.Integer(),   nullable=False),
        sa.Column("created_at",   sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["patient_id"], ["patients.patient_id"]),
        sa.PrimaryKeyConstraint("script_id"),
    )

    # ── queues ───────────────────────────────────────────────────────────────
    op.create_table(
        "queues",
        sa.Column("queue_id",       sa.Integer(),  nullable=False),
        sa.Column("appointment_id", sa.Integer(),  nullable=False),
        sa.Column("status",         sa.String(20), nullable=False),
        sa.Column("express_code",   sa.String(30), nullable=False),
        sa.Column("created_at",     sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["appointment_id"], ["appointments.appointment_id"]),
        sa.PrimaryKeyConstraint("queue_id"),
        sa.UniqueConstraint("express_code"),
    )


def downgrade() -> None:
    op.drop_table("queues")
    op.drop_table("medication_scripts")
    op.drop_index("ix_appointments_phone_number", table_name="appointments")
    op.drop_table("appointments")
    op.drop_table("patients")
    op.drop_table("clinics")