from flask import Blueprint, request, jsonify
import hashlib
import random
import database
from models import User, Notification
from sqlalchemy import or_

# Create a Blueprint for authentication routes
auth_bp = Blueprint('auth', __name__)

def hash_password(password):
    return hashlib.sha256(str.encode(password)).hexdigest()

def generate_otp():
    return str(random.randint(100000, 999999))

@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.json
    login_id = data.get('login_id') # Can be email or phone
    password = data.get('password')
    
    if not login_id or not password:
        return jsonify({"error": "Missing credentials"}), 400
        
    db = database.Session()
    try:
        hashed_pwd = hash_password(password)
        
        # Check for matching email/phone and password
        user = db.query(User).filter(
            or_(User.email == login_id, User.phone_number == str(login_id)),
            User.password == hashed_pwd
        ).first()
        
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401
            
        user_dict = user.to_dict()
        
        if not user.active:
            return jsonify({"error": "Your account has been deactivated"}), 403
        
        # Check if first login forces a reset
        if user.first_login:
            return jsonify({"force_reset": True, "email": user.email}), 200
            
        # Remove sensitive data before sending to React
        del user_dict['password']
        
        return jsonify({
            "message": "Login successful",
            "user": user_dict,
            "token": "dummy-jwt-token-replace-in-prod" # Placeholder for future JWT implementation
        }), 200
    finally:
        db.close()

@auth_bp.route('/api/auth/status', methods=['GET', 'POST'])
def check_auth_status():
    data = request.json if request.is_json else {}
    email = request.args.get('email') or data.get('email') or request.args.get('login_id') or data.get('login_id')
    emp_id = request.args.get('emp_id') or data.get('emp_id')
    
    if not email and not emp_id:
        return jsonify({"active": True}), 200

    db = database.Session()
    try:
        user = None
        if email:
            user = db.query(User).filter(or_(User.email == str(email), User.employee_id == str(email))).first()
        if not user and emp_id:
            user = db.query(User).filter(User.employee_id == str(emp_id)).first()

        if not user:
            return jsonify({"active": False, "error": "User account no longer exists."}), 401
            
        if not user.active:
            return jsonify({"active": False, "error": "Your account has been deactivated by an administrator."}), 403

        return jsonify({"active": True, "user": user.to_dict()}), 200
    finally:
        db.close()

@auth_bp.route('/api/reset-first-password', methods=['POST'])
def reset_first_password():
    data = request.json
    email = data.get('email')
    new_password = data.get('new_password')
    
    if len(new_password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400
        
    db = database.Session()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        user.password = hash_password(new_password)
        user.first_login = False
        db.commit()
        
        return jsonify({"message": "Password reset successfully. You can now log in."}), 200
    finally:
        db.close()

# ==========================================
# ENTERPRISE NOTIFICATION ENDPOINTS
# ==========================================

@auth_bp.route('/api/notifications', methods=['GET'])
def get_notifications():
    """Fetches all notifications for a specific user"""
    emp_id = request.args.get('emp_id')
    if not emp_id:
        return jsonify({"error": "Employee ID is required"}), 400
        
    db = database.Session()
    try:
        user = db.query(User).filter(User.employee_id == str(emp_id)).first()
        search_ids = [str(emp_id)]
        if user and user.email:
            search_ids.append(str(user.email))
        notifs = db.query(Notification).filter(Notification.emp_id.in_(search_ids)).order_by(Notification.id.desc()).all()
        return jsonify([n.to_dict() for n in notifs]), 200
    finally:
        db.close()


@auth_bp.route('/api/notifications/mark-read', methods=['POST'])
def mark_read():
    """Marks a single notification as read"""
    data = request.json
    ticket_id = data.get('ticket_id')
    
    db = database.Session()
    try:
        notifs = db.query(Notification).filter(Notification.ticket_id == ticket_id).all()
        if not notifs:
            return jsonify({"error": "Notification not found"}), 404
            
        for n in notifs:
            n.is_read = True
        db.commit()
        
        return jsonify({"message": "Marked as read"}), 200
    finally:
        db.close()


@auth_bp.route('/api/notifications/mark-all-read', methods=['POST'])
def mark_all_read():
    """Marks all notifications for a user as read"""
    data = request.json
    emp_id = data.get('emp_id')
    
    db = database.Session()
    try:
        user = db.query(User).filter(User.employee_id == str(emp_id)).first()
        search_ids = [str(emp_id)]
        if user and user.email:
            search_ids.append(str(user.email))
        notifs = db.query(Notification).filter(Notification.emp_id.in_(search_ids)).all()
        if not notifs:
            return jsonify({"message": "No notifications to update"}), 200
            
        for n in notifs:
            n.is_read = True
        db.commit()
        
        return jsonify({"message": "All marked as read"}), 200
    finally:
        db.close()