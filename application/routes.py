from flask import jsonify,request,render_template,send_from_directory
from app import app
from flask_security import auth_required, roles_required,current_user,login_user,roles_accepted
from application.database import db
from werkzeug.security import check_password_hash,generate_password_hash
#from .resources import roles_list
from .models import *
from sqlalchemy import cast,Float
import matplotlib.pyplot as plt
from datetime import datetime
import uuid

@app.route('/',methods=['GET'])
def home():
    return render_template('index.html')


@app.route('/api/login',methods=['POST'])
def login():
    body = request.get_json()
    username= body.get('username')
    password=body.get('password')



    user=app.security.datastore.find_user(username=username)# Here i am suplying the username Ravi21
    if user and user.active == True:
        if check_password_hash(user.password,password):
            login_user(user)
            role=user.roles
            role_assigned=""
            for role in user.roles:
                role_assigned=role.name
            return jsonify({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                "error": "No error User Login Succes",
                "success": True,
                "auth-token":user.get_auth_token(),
                "role":role_assigned
            })
        else:
            return jsonify({'error':'Wrong Credentials'}),401
    else:
        return jsonify({'error':'User not found'}),404


@app.route('/api/admin/dashboard', methods=['GET'])
@auth_required('token') #for authentication
@roles_required('admin') #RBAC
def admin_dashboard():

    return jsonify({
        "total_courses": Course.query.count(),
        "total_examinations": Examination.query.count(),
        "total_students": Student.query.count(),
        "total_examiners": Examiner.query.count(),
        "total_slots": ExaminationSlot.query.count(),
        "total_bookings": Booking.query.count()
    }), 200


# --------------------------------------------------
# VIEW ALL COURSES
# --------------------------------------------------

@app.route('/api/admin/courses', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_courses():

    courses = Course.query.all()

    return jsonify({
        "courses": [
            {
                "course_id": c.course_id,
                "course_code": c.course_code,
                "course_name": c.course_name,
                "description": c.description,
                "status": c.status
            }
            for c in courses
        ]
    }), 200


# --------------------------------------------------
# CREATE COURSE
# --------------------------------------------------

@app.route('/api/admin/courses', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def create_course():

    body = request.get_json(silent=True) or {}
    print(body)
    course_name = body.get('course_name')
    course_code = body.get('course_code')
    description = body.get('description')

    if not isinstance(course_name, str) or not course_name.strip():
        return jsonify({
            "success": False,
            "message": "Course name is required"
        }), 400

    if not isinstance(course_code, str) or not course_code.strip():
        return jsonify({
            "success": False,
            "message": "Course code is required"
        }), 400

    course_name = course_name.strip()
    course_code = course_code.strip().upper()

    if len(course_name) > 100:
        return jsonify({
            "success": False,
            "message": "Course name cannot exceed 100 characters"
        }), 400

    if len(course_code) > 10:
        return jsonify({
            "success": False,
            "message": "Course code cannot exceed 10 characters"
        }), 400

    if description is not None and not isinstance(description, str):
        return jsonify({
            "success": False,
            "message": "Description must be text"
        }), 400

    if description and len(description) > 255:
        return jsonify({
            "success": False,
            "message": "Description cannot exceed 255 characters"
        }), 400

    course = Course(
        course_name=course_name,
        course_code=course_code,
        description=description.strip() if description else None,
        status="active"
    )

    db.session.add(course)

    try:
        db.session.commit()

    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Course name or course code already exists"
        }), 409

    except Exception:
        db.session.rollback()
        app.logger.exception("Failed to create course")

        return jsonify({
            "success": False,
            "message": "An internal error occurred while creating the course"
        }), 500

    return jsonify({
        "success": True,
        "message": "Course created successfully",
        "course_id": course.course_id
    }), 201


# --------------------------------------------------
# UPDATE COURSE
# --------------------------------------------------

@app.route('/api/admin/courses/<string:course_id>', methods=['PUT'])
@auth_required('token')
@roles_required('admin')
def update_course(course_id):

    course = db.session.get(Course, course_id)

    if not course:
        return jsonify({"message": "Course not found"}), 404

    body = request.get_json() or {}

    if 'course_name' in body:
        course.course_name = body['course_name']

    if 'course_code' in body:
        course.course_code = body['course_code']

    if 'description' in body:
        course.description = body['description']

    if 'status' in body:
        course.status = body['status']

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({"message": "Unable to update course"}), 409

    return jsonify({
        "success": True,
        "message": "Course updated successfully"
    }), 200


# --------------------------------------------------
# CREATE EXAMINATION
# --------------------------------------------------

@app.route('/api/admin/examinations', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def create_examination():

    body = request.get_json() or {}

    required_fields = [
        'course_id', 'exam_name', 'exam_type',
        'duration', 'max_marks'
    ]

    if any(body.get(field) is None for field in required_fields):
        return jsonify({
            "message": "All required examination fields must be provided"
        }), 400

    course = db.session.get(Course, body['course_id'])

    if not course:
        return jsonify({"message": "Course not found"}), 404

    try:
        duration = int(body['duration'])
        max_marks = int(body['max_marks'])
    except (ValueError, TypeError):
        return jsonify({
            "message": "Duration and max_marks must be integers"
        }), 400

    if duration <= 0 or max_marks <= 0:
        return jsonify({
            "message": "Duration and max_marks must be positive"
        }), 400

    examination = Examination(
        course_id=body['course_id'],
        exam_name=body['exam_name'],
        exam_type=body['exam_type'],
        duration=duration,
        max_marks=max_marks,
        exam_status="active"
    )

    db.session.add(examination)

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({
            "message": "Could not create examination. Check for duplicate names."
        }), 409

    return jsonify({
        "success": True,
        "message": "Examination created successfully",
        "exam_id": examination.exam_id
    }), 201


# --------------------------------------------------
# VIEW ALL EXAMINATIONS
# --------------------------------------------------

@app.route('/api/admin/examinations', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_examinations():

    examinations = Examination.query.all()

    return jsonify({
        "examinations": [
            {
                "exam_id": e.exam_id,
                "exam_name": e.exam_name,
                "course_id": e.course_id,
                "exam_type": e.exam_type,
                "duration": e.duration,
                "max_marks": e.max_marks,
                "exam_status": e.exam_status
            }
            for e in examinations
        ]
    }), 200
