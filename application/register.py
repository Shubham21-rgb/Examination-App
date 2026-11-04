#   ----            Registration            ----
from flask import jsonify,request,render_template,send_from_directory
from app import app
from flask_security import auth_required, roles_required,current_user,login_user,roles_accepted
from application.database import db
from werkzeug.security import check_password_hash,generate_password_hash
#from .resources import roles_list
from .models import *
from sqlalchemy import cast,Float
import matplotlib.pyplot as plt
from datetime import datetime,timedelta
import uuid

@app.route(
   "/api/register",
   methods=["POST"]
)
def register_student():

    body = request.get_json(silent=True) or {}

    username = body.get('username')
    email = body.get('email')
    password = body.get('password')

    # if not username or not email or not password:
    #     return jsonify({
    #         "success": False,
    #         "message": "All fields are required."
    #     }), 400

    username = username.strip()
    email = email.strip().lower()

    existing_email = User.query.filter_by(
        email=email
    ).first()

    if existing_email:
        return jsonify({
            "success": False,
            "message": "Email is already registered."
        }), 409

    existing_username = User.query.filter_by(
        username=username
    ).first()

    if existing_username:
        return jsonify({
            "success": False,
            "message": "Username is already taken."
        }), 409

    student_role = app.security.datastore.find_role("student")

    if not student_role:
        return jsonify({
            "success": False,
            "message": "Student role does not exist. Contact administrator."
        }), 500
    
    try:
        user = app.security.datastore.create_user(
            username=username,
            email=email,
            password=generate_password_hash(password),
            active=True,
            roles=[student_role]
        )

        db.session.flush()  # Making sure that User.id is generated before any operations why ?

        student = Student(
            user_id=user.id
        )

        db.session.add(student)

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Student registered successfully.",
            "student": {
                "student_id": student.student_id,
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "role": "student"
            }
        }), 201

    except IntegrityError:
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "Username or email already exists."
        }), 409

    except Exception as e:
        db.session.rollback()

        print("Student Registration Error:", str(e))

        return jsonify({
            "success": False,
            "message": "Something went wrong during registration."
        }), 500