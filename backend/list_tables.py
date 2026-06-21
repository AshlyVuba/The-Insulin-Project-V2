import sqlalchemy

engine = sqlalchemy.create_engine('postgresql://postgres:Allecate@localhost:5432/insulin_express')
inspector = sqlalchemy.inspect(engine)

print("\n--- ACTUAL TABLES IN YOUR DATABASE ---")
for table_name in inspector.get_table_names():
    print(f"👉 {table_name}")
print("---------------------------------------\n")