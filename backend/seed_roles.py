import sqlalchemy


def seed_correct_enum_data():
    DATABASE_URL = 'postgresql://postgres:Allecate@localhost:5432/insulin_express'
    engine = sqlalchemy.create_engine(DATABASE_URL)

    # Empty tables cleanly before re-injecting records
    raw_clear = "TRUNCATE TABLE appointments, patients, clinics RESTART IDENTITY CASCADE;"

    # Raw SQL script tailored strictly to your actual database columns
    raw_insert = '''
    -- 1. Setup Base Clinic with required timestamp field
    INSERT INTO clinics (clinic_id, clinic_name, facility_code, location, province, created_at) 
    VALUES (1, 'Main Transit Clinic Alpha', 'FC-ALPHA', 'Gauteng Hub', 'Gauteng', NOW()) 
    ON CONFLICT (clinic_id) DO NOTHING;

    -- 2. Setup Patients with required timestamp field
    INSERT INTO patients (patient_id, clinic_id, first_name, last_name, national_id, facility_patient_number, phone_number, tracking_status, date_of_birth, gender, created_at) 
    VALUES 
    (101, 1, 'Alice', 'Smith', 'ID800101', 'FPN-101', '+27812345678', 'ACTIVE', '1985-05-12', 'FEMALE', NOW()),
    (102, 1, 'Bob', 'Jones', 'ID800102', 'FPN-102', '+27812345679', 'ACTIVE', '1990-11-23', 'MALE', NOW()),
    (103, 1, 'Charlie', 'Brown', 'ID800103', 'FPN-103', '+27812345680', 'ACTIVE', '1978-03-15', 'MALE', NOW());

    -- 3. Setup Appointments (Removed created_at to avoid column errors)
    INSERT INTO appointments (patient_id, collection_date, time_slot, status, phone_number, phone_number_hash) 
    VALUES 
    (101, CURRENT_DATE, '08:00-09:00', 'confirmed', '+27812345678', 'mock_hash_1'),
    (102, CURRENT_DATE, '09:00-10:00', 'confirmed', '+27812345679', 'mock_hash_2'),
    (103, CURRENT_DATE, '10:00-11:00', 'confirmed', '+27812345680', 'mock_hash_3');
    '''

    try:
        with engine.connect() as conn:
            conn.execute(sqlalchemy.text(raw_clear))
            conn.execute(sqlalchemy.text(raw_insert))
            conn.commit()
        print("\n------------------------------------------------------------")
        print("🚀 SUCCESS: Schema-matched data seeded beautifully!")
        print("------------------------------------------------------------")
    except Exception as e:
        print(f"\n❌ Error seeding tracking data: {e}")


if __name__ == '__main__':
    seed_correct_enum_data()