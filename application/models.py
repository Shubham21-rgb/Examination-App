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
    users = db.relationship('User', secondary=roles_users, back_populates='roles')
#--- Id generator Function (User based ID)-----
def generate_uuid():
    id=uuid.uuid4()
    value=str(id).split('-')[4]
    return value
     
class User(db.Model, UserMixin):
    id=db.Column(db.String(10),primary_key=True,default=generate_uuid)
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
    roles = db.relationship('Role', secondary=roles_users, back_populates='users') # many to many relationship with Role table
    student = db.relationship('Student', back_populates='user', uselist=False)
    examiner = db.relationship('Examiner', back_populates='user', uselist=False)

#----------Examiner Table----

class Examiner(db.Model):
    __tablename__ = 'examiner'
    examiner_id=db.Column(db.String(10), primary_key=True,default=generate_uuid)
    user_id=db.Column(db.ForeignKey('user.id'),nullable=False)
    user=db.relationship('User', back_populates='examiner')
    slots=db.relationship('ExaminationSlot', back_populates='examiner')
    #need to implement more feilds

#----------Student Table----
class Student(db.Model):
    __tablename__ = 'student'
    student_id=db.Column(db.String(10), primary_key=True,default=generate_uuid)
    user_id=db.Column(db.ForeignKey('user.id'),nullable=False,unique=True)
    user=db.relationship('User', back_populates='student')
    bookings=db.relationship('Booking', back_populates='student')
    #need to implement more feilds

#------------course id generator---------------------------------------------
def generate_course_id():
    id=uuid.uuid4()
    value=str(id).split('-')[4]
    return value


def generate_course_code(course_name):
    id=uuid.uuid4()
    value=str(id).split('-')[4]
    examcode=["CHEMISTRY","PHYSICS","BIOLOGY","MATHEMATICS","ENGLISH","HINDI","GEOGRAPHY","HISTORY","CIVICS","ECONOMICS","POLITICAL SCIENCE","PSYCHOLOGY","SOCIOLOGY","COMPUTER SCIENCE","INFORMATION TECHNOLOGY","ARTS","MUSIC","DANCE","THEATRE","FILM STUDIES","FASHION DESIGN","INTERIOR DESIGN","GRAPHIC DESIGN","WEB DESIGN","ANIMATION","GAME DESIGN","ARCHITECTURE"]
    if course_name in examcode:
        return course_name+value


class Course(db.Model):
    __tablename__ = 'course'
    course_id=db.Column(db.String(10), primary_key=True,default=generate_course_id)
    course_code=db.Column(db.String(10), unique=True,nullable=False,default=generate_course_id)
    course_name=db.Column(db.String(100),unique=True,nullable=False)
    description=db.Column(db.String(255),nullable=True)
    status=db.Column(db.String(50),nullable=False,default='active')
    examinations=db.relationship('Examination', back_populates='course', cascade='all, delete-orphan')

#------------Examination id generator---------------------------------------------
def generate_exam_id():
    id=uuid.uuid4()
    value=str(id).split('-')[4]
    return value

class Examination(db.Model):
    __tablename__ = 'examination'
    exam_id=db.Column(db.String(10), primary_key=True,default=generate_exam_id)
    course_id=db.Column(db.ForeignKey('course.course_id'),nullable=False)
    exam_name=db.Column(db.String(100),unique=True,nullable=False)
    exam_type=db.Column(db.String(50),nullable=False)
    duration=db.Column(db.Integer,nullable=False)
    max_marks=db.Column(db.Integer,nullable=False)
    slot_create_start_date=db.Column(db.DateTime,nullable=False,default=datetime.utcnow)
    slot_create_end_date=db.Column(db.DateTime,nullable=False,default=datetime.utcnow)
    slot_booking_start_date=db.Column(db.DateTime,nullable=False,default=datetime.utcnow)
    slot_booking_end_date=db.Column(db.DateTime,nullable=False,default=datetime.utcnow)
    exam_status=db.Column(db.String(50),nullable=False,default='active')
    course=db.relationship('Course', back_populates='examinations')
    rubric=db.relationship('ExaminationRubric', back_populates='examination', cascade='all, delete-orphan')
    slots=db.relationship('ExaminationSlot', back_populates='examination', cascade='all, delete-orphan')

#-----------Examination Rubric id generator---------------------------------------------
def generate_exam_rubric_id():
    id=uuid.uuid4()
    value=str(id).split('-')[4]
    return value

class ExaminationRubric(db.Model):
    __tablename__ = 'examination_rubric'
    rubric_id=db.Column(db.String(10), primary_key=True,default=generate_exam_rubric_id)
    exam_id=db.Column(db.ForeignKey('examination.exam_id'),nullable=False)
    criterion_name=db.Column(db.String(100),nullable=False)
    max_marks=db.Column(db.Integer,nullable=False)
    rubric_weightage=db.Column(db.String(50),nullable=False,default='active')
    rubric_description=db.Column(db.String(255),nullable=True)
    examination=db.relationship('Examination', back_populates='rubric')

#---------------Examination Slot id generator---------------------------------------------
def generate_exam_slot_id():
    id=uuid.uuid4()
    value=str(id).split('-')[4]
    return value

class ExaminationSlot(db.Model):
    __tablename__ = 'examination_slot'
    slot_id=db.Column(db.String(10), primary_key=True,default=generate_exam_slot_id)
    exam_id=db.Column(db.ForeignKey('examination.exam_id'),nullable=False)
    examiner_id=db.Column(db.ForeignKey('examiner.examiner_id'),nullable=False)
    date=db.Column(db.DateTime,nullable=False,default=datetime.utcnow)
    start_time=db.Column(db.DateTime,nullable=False,default=datetime.utcnow)
    end_time=db.Column(db.DateTime,nullable=False,default=datetime.utcnow)
    max_student_capacity=db.Column(db.Integer,nullable=False)
    available_seats=db.Column(db.Integer,nullable=False)
    status=db.Column(db.String(50),nullable=False,default='active')
    meet_link=db.Column(db.String(255),nullable=True)
    examination=db.relationship('Examination', back_populates='slots')
    examiner=db.relationship('Examiner', back_populates='slots')
    bookings=db.relationship('Booking', back_populates='slot')

#--------Booking Table ------
class Booking(db.Model):
    __tablename__ = 'booking'
    booking_id=db.Column(db.String(10), primary_key=True,default=generate_uuid)
    student_id=db.Column(db.ForeignKey('student.student_id'),nullable=False)
    slot_id=db.Column(db.ForeignKey('examination_slot.slot_id'),nullable=False)
    booking_status=db.Column(db.String(50),nullable=False,default='active')
    student=db.relationship('Student', back_populates='bookings')
    slot=db.relationship('ExaminationSlot', back_populates='bookings')
    evaluation=db.relationship('Evaluation', back_populates='booking', uselist=False)

    __table_args__ = (
        db.UniqueConstraint('student_id', 'slot_id', name='unique_student_slot'),
    )
#-------Evaluation Table ------
class Evaluation(db.Model):
    __tablename__ = 'evaluation'
    evaluation_id=db.Column(db.String(10), primary_key=True,default=generate_uuid)
    booking_id=db.Column(db.ForeignKey('booking.booking_id'),nullable=False)
    student_id=db.Column(db.ForeignKey('student.student_id'),nullable=False)
    examiner_id=db.Column(db.ForeignKey('examiner.examiner_id'),nullable=False)
    total_marks=db.Column(db.Integer,nullable=False)
    marks_obtained=db.Column(db.Integer,nullable=False)
    remarks=db.Column(db.String(255),nullable=True)
    evaluation_date=db.Column(db.DateTime,nullable=False,default=datetime.utcnow)
    status=db.Column(db.String(50),nullable=False,default='active')
    booking = db.relationship('Booking',back_populates='evaluation')
