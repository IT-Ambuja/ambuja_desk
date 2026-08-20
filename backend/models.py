from sqlalchemy import Column, Integer, String, Boolean, Float, Text
from sqlalchemy.orm import declarative_base

class BaseModel:
    def to_dict(self):
        result = {}
        for c in self.__table__.columns:
            # Skip surrogate primary keys if they shouldn't be exposed
            if c.name == 'id' and self.__tablename__ not in ['ticket_logs', 'notifications', 'canned_responses']:
                continue
                
            val = getattr(self, c.name)
            # Pandas converted float NaN to None when replaced
            result[c.name] = val
            
            # Map 'SLA_Breach' column to the proper name if it differs in the DB
            if self.__tablename__ == 'tickets' and c.name == 'SLA_Breach':
                result['SLA_Breach'] = val
                
        return result

Base = declarative_base(cls=BaseModel)

class User(Base):
    __tablename__ = 'users'
    employee_id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    password = Column(String)
    name = Column(String)
    department = Column(String)
    phone_number = Column(String)
    role = Column(String)
    designation = Column(String)
    reporting_manager = Column(String)
    first_login = Column(Boolean, default=True)
    active = Column(Boolean, default=True)
    secondary_roles = Column(String, default='')
    viewer_locations = Column(Text, default='')

class Location(Base):
    __tablename__ = 'locations'
    # Assuming location name is unique, if not we could add an ID. But CSV lacks it.
    location = Column(String, primary_key=True)
    project = Column(String)
    tower = Column(String)

class Project(Base):
    __tablename__ = 'projects'
    project_name = Column(String, primary_key=True)

class Ticket(Base):
    __tablename__ = 'tickets'
    id = Column(Integer, primary_key=True, autoincrement=True)
    ticket_id = Column(String)
    raised_by = Column(String)
    dept_assigned = Column(String)
    issue_category = Column(String)
    activity_category = Column(String)
    description = Column(Text)
    status = Column(String)
    assigned_to = Column(String)
    notify_users = Column(Text)
    location = Column(String)
    timestamp = Column(String)
    deadline = Column(String)
    attachment = Column(String)
    solver_notified = Column(Boolean)
    solver_resolution_hours = Column(Float)
    solver_delay_hours = Column(Float)
    closure_delay_hours = Column(Float)
    ticket_age_hours = Column(Float)
    total_turnaround_hours = Column(Float)
    SLA_Breach = Column('SLA_Breach', Boolean)
    closure_type = Column(String)
    reassign_requested_to = Column(String)
    reassign_reason = Column(String)
    solver_comments = Column(Text)
    original_raiser = Column(String)
    escalation_level = Column(String)
    solved_timestamp = Column(String)
    closed_timestamp = Column(String)
    sla_notified = Column(Boolean)
    absolute_deadline = Column(String)
    has_extended = Column(String)
    severity = Column(String)
    notified_1_3 = Column(Boolean, default=False)
    notified_2_3 = Column(Boolean, default=False)

class TicketLog(Base):
    __tablename__ = 'ticket_logs'
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(String)
    ticket_id = Column(String)
    user = Column(String)
    action = Column(String)
    details = Column(Text)
    remarks = Column(Text)
    attachment = Column(String)
    severity = Column(String)

class Department(Base):
    __tablename__ = 'departments'
    department_name = Column(String, primary_key=True)

class IssueCategory(Base):
    __tablename__ = 'issue_categories'
    issue_name = Column(String, primary_key=True)

class ActivityCategory(Base):
    __tablename__ = 'activity_categories'
    activity_name = Column(String, primary_key=True)

class Notification(Base):
    __tablename__ = 'notifications'
    id = Column(Integer, primary_key=True, autoincrement=True)
    ticket_id = Column(String)
    emp_id = Column(String)
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    role_context = Column(String)
    timestamp = Column(String)
    severity = Column(String)



class SystemLog(Base):
    __tablename__ = 'system_logs'
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(String)
    actor_email = Column(String)
    action = Column(String)
    target = Column(String)
    details = Column(String)

class CannedResponse(Base):
    __tablename__ = 'canned_responses'
    id = Column(Integer, primary_key=True, autoincrement=True)
    label = Column(String, nullable=False)
    text = Column(Text, nullable=False)
    created_by = Column(String)
    is_custom = Column(Boolean, default=False)
    timestamp = Column(String)

class AIRoutingFeedback(Base):
    __tablename__ = 'ai_routing_feedbacks'
    id = Column(Integer, primary_key=True, autoincrement=True)
    query = Column(Text, nullable=False)
    suggested_dept = Column(String)
    suggested_issue = Column(String)
    suggested_act = Column(String)
    suggested_solver = Column(String)
    user_selected_dept = Column(String)
    user_selected_issue = Column(String)
    user_selected_act = Column(String)
    user_selected_solver = Column(String)
    feedback_score = Column(Float, default=1.0)
    timestamp = Column(String)
