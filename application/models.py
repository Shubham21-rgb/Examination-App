from .database import db
from flask_security import UserMixin, RoleMixin #Flask security is mandatory
from datetime import datetime
import uuid

roles_users = db.Table('roles_users',
                       db.Column('user_id', db.Integer(), db.ForeignKey('user.id')),
                       db.Column('role_id', db.Integer(), db.ForeignKey('role.id'))
)

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer(), primary_key=True,autoincrement=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

#--- Id generator Function -----
def generate_uuid():
    id=uuid.uuid4()
    value=str(id).split('-')[4]
    examcode="EXM"
    endcode="NPTEL"
    if (value):
        code=examcode+value+endcode
    return code
     
class User(db.Model, UserMixin):
    id=db.Column(generate_uuid(), primary_key=True)
    email=db.Column(db.String(100), unique=True, nullable=False)
    password=db.Column(db.String(255), nullable=False,unique=False) #password cannot be unique as multiple users can have same password
    username=db.Column(db.String(100), unique=True, nullable=False)
    active=db.Column(db.Boolean(), default=True)
    # Flask-Security specific column
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    #Timestamp columns
    created_at=db.Column(db.DateTime, default=datetime.utcnow)
    updated_at=db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    #Relationships
    roles = db.relationship('Role', secondary=roles_users, backref=db.backref('users', lazy='dynamic'))

#Need to create extra 10 tables as per the requirments