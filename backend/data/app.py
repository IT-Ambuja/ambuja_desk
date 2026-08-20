import os
from flask import Flask, send_from_directory, request, abort
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

from auth_api import auth_bp
from ticket_api import ticket_bp
from admin_api import admin_bp

app = Flask(__name__)
# Allow React (usually running on port 3000 or 5173) to talk to Flask
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Define the path to the physical uploads directory
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload directory exists when the server starts
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Create a secure static route to serve these files to React
@app.route('/uploads/<filename>')
def serve_uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Create a tokenized API route for secure external access (like CSV exports)
# Value lives in backend/.env (API_SECURE_TOKEN); matches the token style from AssetInfinity.
API_SECURE_TOKEN = os.environ.get('API_SECURE_TOKEN')

@app.route('/api/token/file/<filename>')
def serve_tokenized_file(filename):
    token = request.args.get('token')
    if not API_SECURE_TOKEN:
        # Fail closed: an unset token must never mean "no token required".
        abort(403, description="Forbidden: secure token not configured on the server.")
    if not token or token != API_SECURE_TOKEN:
        abort(403, description="Forbidden: Invalid or missing secure token.")
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
# =========================================================

@app.before_request
def check_user_active_status():
    if request.method == 'OPTIONS':
        return None

    # Only enforce on /api routes, excluding public / non-user specific routes
    if request.path.startswith('/api'):
        exempt_paths = [
            '/api/login',
            '/api/reset-first-password',
            '/api/auth/status',
            '/api/token/file'
        ]
        if any(request.path.startswith(p) for p in exempt_paths):
            return None

        # Check for user identity header passed by frontend
        user_email = request.headers.get('X-User-Email')
        user_emp_id = request.headers.get('X-User-EmpId')

        if user_email or user_emp_id:
            import database
            from models import User
            from sqlalchemy import or_
            db = database.Session()
            try:
                user = None
                if user_email:
                    user = db.query(User).filter(or_(User.email == str(user_email), User.employee_id == str(user_email))).first()
                if not user and user_emp_id:
                    user = db.query(User).filter(User.employee_id == str(user_emp_id)).first()

                if user and not user.active:
                    from flask import jsonify
                    return jsonify({"error": "Your account has been deactivated by an administrator."}), 403
            finally:
                db.close()

# Register all route files
app.register_blueprint(auth_bp)
app.register_blueprint(ticket_bp)
app.register_blueprint(admin_bp)

if __name__ == '__main__':
    # Initialize the database automatically if it doesn't exist
    try:
        import sys
        sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
        from init_db import init_db
        print("Running automatic database initialization...")
        init_db()
    except Exception as e:
        print(f"Failed to auto-initialize database: {e}")

    import threading
    import time
    import database
    
    def run_background_tasks():
        while True:
            try:
                database.auto_check_sla_breaches()
                database.auto_close_resolved_tickets()
                database.sync_computed_ticket_metrics()
            except Exception as e:
                print(f"Background task error: {e}")
            time.sleep(60)
            
    bg_thread = threading.Thread(target=run_background_tasks, daemon=True)
    bg_thread.start()

    # debug=True with use_reloader=True auto-reloads the server upon code changes
    app.run(host='0.0.0.0', debug=True, port=5001, use_reloader=True)
