import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'data')))
import database
from models import User

def fix_reporting_manager():
    db = database.Session()
    try:
        users = db.query(User).filter(User.reporting_manager.like('%.0')).all()
        updated = 0
        for user in users:
            user.reporting_manager = user.reporting_manager[:-2]
            updated += 1
        
        # Also clean up employee_id in case there are any .0
        users_emp = db.query(User).filter(User.employee_id.like('%.0')).all()
        for user in users_emp:
            # Updating primary key might be tricky in SQLAlchemy, but let's try
            # If it fails we can do it via raw SQL
            user.employee_id = user.employee_id[:-2]
            updated += 1
            
        db.commit()
        print(f"Updated {updated} users")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == '__main__':
    fix_reporting_manager()
