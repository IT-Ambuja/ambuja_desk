import os
import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv
from models import Base

load_dotenv()

# The DB_PATHS from the old system to find the CSVs
DB_PATHS = {
    'users': 'data/Users.csv',

    'locations': 'data/location.csv',
    'tickets': 'data/tickets.csv',
    'logs': 'data/ticket_logs.csv',
    'issue_activity': 'data/issue_activity.csv',
    'notifications': 'data/Notifications.csv'
}

TABLE_NAMES = {
    'users': 'users',

    'locations': 'locations',
    'tickets': 'tickets',
    'logs': 'ticket_logs',
    'issue_activity': 'issue_activity',
    'notifications': 'notifications'
}

def init_db():
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        print("Error: DATABASE_URL not found in .env")
        return

    try:
        from sqlalchemy.engine.url import make_url
        from sqlalchemy import text
        
        url_obj = make_url(db_url)
        db_name = url_obj.database
        
        if db_name and 'sqlite' not in db_url.lower():
            # Connect to default 'postgres' database to verify/create target database
            postgres_url = url_obj.set(database='postgres')
            engine_pg = create_engine(postgres_url, isolation_level="AUTOCOMMIT")
            
            with engine_pg.connect() as conn:
                result = conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname='{db_name}'"))
                if not result.scalar():
                    print(f"[DB Auto-Create] Database '{db_name}' does not exist. Creating...")
                    conn.execute(text(f'CREATE DATABASE "{db_name}"'))
                    print(f"[DB Auto-Create] Database '{db_name}' created successfully.")
                else:
                    print(f"[DB Auto-Create] Database '{db_name}' verified.")
    except Exception as e:
        print(f"[DB Auto-Create] Note on DB verification: {e}")

    print(f"Connecting to database...")
    engine = create_engine(db_url)

    print("Checking and auto-syncing schema (tables and missing columns)...")
    from data.database import auto_sync_schema, seed_canned_responses, Session
    auto_sync_schema(engine)
    seed_canned_responses(Session)

    print("Migrating CSV data to PostgreSQL...")
    for key, csv_path in DB_PATHS.items():
        table_name = TABLE_NAMES[key]
        if os.path.exists(csv_path):
            print(f"Reading {csv_path}...")
            df = pd.read_csv(csv_path)
            
            # Clean up column names for specific tables
            if key in ['users', 'locations', 'issue_activity']:
                df.rename(columns=lambda x: str(x).lower().replace(" ", "_"), inplace=True)
            
            # For logs and issue_activity and notifications we might have an 'id' column in the schema that isn't in the CSV.
            # to_sql with if_exists='append' handles missing auto-increment columns perfectly.
            # We must drop columns that don't match the schema or drop them in the dataframe.
            
            if key == 'notifications':
                if 'notif_id' in df.columns:
                    df = df.drop(columns=['notif_id'])
                if 'user_email' in df.columns:
                    df = df.drop(columns=['user_email'])
            
            try:
                # Check if table has data
                with engine.connect() as conn:
                    from sqlalchemy import text
                    count = conn.execute(text(f'SELECT COUNT(*) FROM "{table_name}"')).scalar()
                
                if count > 0:
                    print(f"Table '{table_name}' already has data. Skipping CSV migration.")
                else:
                    # Clear existing data just in case this is run multiple times
                    with engine.begin() as conn:
                        conn.exec_driver_sql(f'TRUNCATE TABLE "{table_name}" RESTART IDENTITY CASCADE')
                    
                    df.to_sql(table_name, engine, if_exists='append', index=False)
                    print(f"Successfully migrated {len(df)} rows into '{table_name}'.")
            except Exception as e:
                print(f"Failed to migrate {table_name}: {e}")
        else:
            print(f"Skipping {csv_path} - file not found.")
            
    print("Ensuring dummy Super Admin user exists...")
    from sqlalchemy.orm import sessionmaker
    import hashlib
    from models import User
    
    Session = sessionmaker(bind=engine)
    db = Session()
    try:
        admin_email = "super@company.com"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            pwd_hash = hashlib.sha256(str.encode("Kolkata@123")).hexdigest()
            new_admin = User(
                employee_id="EMP-SUPER",
                email=admin_email,
                password=pwd_hash,
                name="Super Admin",
                department="Management",
                phone_number="0000000000",
                role="Superadmin",
                designation="Director",
                reporting_manager="",
                first_login=True,
                active=True
            )
            db.add(new_admin)
            db.commit()
            print("Dummy Super Admin user created.")
        else:
            print("Dummy Super Admin user already exists.")
            
        admin_email2 = "admin@company.com"
        admin2 = db.query(User).filter(User.email == admin_email2).first()
        if not admin2:
            pwd_hash = hashlib.sha256(str.encode("Kolkata@123")).hexdigest()
            new_admin2 = User(
                employee_id="EMP-ADMIN",
                email=admin_email2,
                password=pwd_hash,
                name="Admin User",
                department="Management",
                phone_number="0000000000",
                role="Admin",
                designation="Manager",
                reporting_manager="EMP-SUPER",
                first_login=True,
                active=True
            )
            db.add(new_admin2)
            db.commit()
            print("Dummy Admin user created.")
        else:
            print("Dummy Admin user already exists.")
    except Exception as e:
        print(f"Failed to create dummy Super Admin: {e}")
    finally:
        db.close()

    print("Migration complete!")

if __name__ == "__main__":
    init_db()
