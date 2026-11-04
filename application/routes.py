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

    courses = Course.query.all()6

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


from datetime import date,time

#--------------------------------- Examiner Functions -------------------------------
# =========================================================
# HELPER FUNCTIONS
# =========================================================

def examiner_for_current_user():
    return Examiner.query.filter_by(
        user_id=current_user.id
    ).first()


def get_assigned_examiner_or_error():
    examiner = examiner_for_current_user()

    if examiner is None:
        return None, (
            jsonify({
                "success": False,
                "message": "Examiner profile not found."
            }),
            404
        )

    return examiner, None


def serialize_exam(exam):
    return {
        "exam_id": exam.exam_id,
        "exam_name": exam.exam_name,
        "course_id": exam.course_id,
        "course_name": (
            exam.course.course_name if exam.course else None
        ),
        "exam_type": exam.exam_type,
        "duration": exam.duration,
        "max_marks": exam.max_marks,
        "exam_status": exam.exam_status,
        "slot_creation_open": getattr(
            exam, "slot_creation_open", True
        ),
        "student_booking_open": getattr(
            exam, "student_booking_open", False
        )
    }


def serialize_slot(slot):
    return {
        "slot_id": slot.slot_id,
        "exam_id": slot.exam_id,
        "exam_name": (
            slot.examination.exam_name
            if slot.examination else None
        ),
        "examiner_id": slot.examiner_id,
        "date": str(slot.date) if slot.date else None,
        "start_time": (
            slot.start_time.strftime("%H:%M")
            if slot.start_time else None
        ),
        "end_time": (
            slot.end_time.strftime("%H:%M")
            if slot.end_time else None
        ),
        "max_student_capacity": slot.max_student_capacity,
        "available_seats": slot.available_seats,
        "status": slot.status,
        "meet_link": slot.meet_link,
        "booking_started": slot_has_bookings(slot),
        "can_edit": (
            not slot_has_bookings(slot)
            and not bool(
                getattr(slot.examination, "student_booking_open", False)
            )
        )
    }


def slot_has_bookings(slot):
    return Booking.query.filter_by(
        slot_id=slot.slot_id
    ).count() > 0


def serialize_booking(booking):
    student = booking.student
    slot = booking.slot
    user = student.user if student else None
    exam = slot.examination if slot else None

    evaluation = Evaluation.query.filter_by(
        booking_id=booking.booking_id
    ).first()

    return {
        "booking_id": booking.booking_id,
        "student_id": booking.student_id,
        "student_username": user.username if user else None,
        "student_email": user.email if user else None,
        "slot_id": booking.slot_id,
        "exam_id": slot.exam_id if slot else None,
        "exam_name": exam.exam_name if exam else None,
        "date": str(slot.date) if slot and slot.date else None,
        "start_time": (
            slot.start_time.strftime("%H:%M")
            if slot and slot.start_time else None
        ),
        "booking_status": booking.booking_status,
        "evaluation_status": (
            evaluation.status if evaluation else "pending"
        ),
        "remarks": evaluation.remarks if evaluation else None
    }


def examiner_owns_slot(examiner, slot):
    return (
        slot is not None
        and slot.examiner_id == examiner.examiner_id
    )


def examiner_has_assigned_exam(examiner, exam_id):
    """
    With the current schema, assignments can be inferred from
    existing slots belonging to this examiner.

    For first-time slot creation, use an explicit exam-to-examiner
    assignment relationship (see notes below).
    """
    return ExaminationSlot.query.filter_by(
        examiner_id=examiner.examiner_id,
        exam_id=exam_id
    ).first() is not None


def slot_creation_is_open(exam):
    return bool(getattr(exam, "slot_creation_open", True))


def booking_has_started(exam, slot=None):
    if bool(getattr(exam, "student_booking_open", False)):
        return True

    if slot is not None and slot_has_bookings(slot):
        return True

    return False


# =========================================================
# 1. EXAMINER DASHBOARD
# GET /api/examiner/dashboard
# =========================================================

@app.route("/api/examiner/dashboard", methods=["GET"])
@auth_required("token")
@roles_required("examiner")
def examiner_dashboard():
    examiner, error = get_assigned_examiner_or_error()
    if error:
        return error

    slots = ExaminationSlot.query.filter_by(
        examiner_id=examiner.examiner_id
    ).all()
    print(slots)

    slot_ids = [slot.slot_id for slot in slots]

    bookings = (
        Booking.query.filter(Booking.slot_id.in_(slot_ids)).all()
        if slot_ids else []
    )

    booking_ids = [booking.booking_id for booking in bookings]

    evaluations = (
        Evaluation.query.filter(
            Evaluation.booking_id.in_(booking_ids)
        ).all()
        if booking_ids else []
    )

    completed_booking_ids = {
        evaluation.booking_id
        for evaluation in evaluations
        if str(evaluation.status or "").lower()
        in ("submitted", "completed")
    }

    pending_count = sum(
        1 for booking in bookings
        if booking.booking_id not in completed_booking_ids
    )

    exam_ids = {slot.exam_id for slot in slots}

    return jsonify({
        "success": True,
        "stats": {
            "assigned_examinations": len(exam_ids),
            "created_slots": len(slots),
            "booked_students": len(bookings),
            "pending_evaluations": pending_count
        }
    }), 200


# =========================================================
# 2. ASSIGNED EXAMINATIONS
# GET /api/examiner/examinations
# =========================================================

@app.route("/api/examiner/examinations", methods=["GET"])
@auth_required("token")
@roles_required("examiner")
def examiner_examinations():
    examiner, error = get_assigned_examiner_or_error()
    if error:
        return error

    exam_ids = db.session.query(
        ExaminationSlot.exam_id
    ).filter_by(
        examiner_id=examiner.examiner_id
    ).distinct().all()

    ids = [row[0] for row in exam_ids]

    examinations = (
        Examination.query.filter(
            Examination.exam_id.in_(ids)
        ).all()
        if ids else []
    )

    return jsonify({
        "success": True,
        "examinations": [
            serialize_exam(exam) for exam in examinations
        ]
    }), 200


# =========================================================
# 3. EXAMINER'S SLOTS
# GET /api/examiner/slots
# =========================================================

@app.route("/api/examiner/slots", methods=["GET"])
@auth_required("token")
@roles_required("examiner")
def examiner_slots():
    examiner, error = get_assigned_examiner_or_error()
    if error:
        return error

    slots = ExaminationSlot.query.filter_by(
        examiner_id=examiner.examiner_id
    ).order_by(
        ExaminationSlot.date.asc()
    ).all()

    return jsonify({
        "success": True,
        "slots": [serialize_slot(slot) for slot in slots]
    }), 200


# =========================================================
# 4. CREATE EXAMINATION SLOT
# POST /api/examiner/slots
# =========================================================

@app.route("/api/examiner/slots", methods=["POST"])
@auth_required("token")
@roles_required("examiner")
def create_examiner_slot():
    examiner, error = get_assigned_examiner_or_error()
    if error:
        return error

    body = request.get_json(silent=True) or {}

    required_fields = [
        "exam_id",
        "date",
        "start_time",
        "end_time",
        "max_student_capacity"
    ]

    missing = [
        field for field in required_fields
        if body.get(field) in (None, "")
    ]

    if missing:
        return jsonify({
            "success": False,
            "message": "Missing required fields.",
            "fields": missing
        }), 400

    exam = db.session.get(Examination, body["exam_id"])

    if exam is None:
        return jsonify({
            "success": False,
            "message": "Examination not found."
        }), 404

    if not slot_creation_is_open(exam):
        return jsonify({
            "success": False,
            "message": "Slot creation is closed for this examination."
        }), 403

    # Assignment must be established by your application.
    # This check supports exams already associated with this examiner.
    if not examiner_has_assigned_exam(
        examiner, exam.exam_id
    ):
        return jsonify({
            "success": False,
            "message": (
                "You are not assigned to this examination. "
                "Ask the admin to assign it to you first."
            )
        }), 403

    try:
        slot_date = date.fromisoformat(body["date"])
        start_time = time.fromisoformat(body["start_time"])
        end_time = time.fromisoformat(body["end_time"])
        capacity = int(body["max_student_capacity"])
    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": "Invalid date, time or student capacity."
        }), 400

    if end_time <= start_time:
        return jsonify({
            "success": False,
            "message": "End time must be later than start time."
        }), 400

    if capacity < 1:
        return jsonify({
            "success": False,
            "message": "Student capacity must be at least 1."
        }), 400

    # Prevent overlapping slots for the same examiner.
    overlapping_slot = ExaminationSlot.query.filter(
        ExaminationSlot.examiner_id == examiner.examiner_id,
        ExaminationSlot.date == slot_date,
        ExaminationSlot.start_time < end_time,
        ExaminationSlot.end_time > start_time
    ).first()

    if overlapping_slot:
        return jsonify({
            "success": False,
            "message": "This slot overlaps with another assigned slot."
        }), 409

    slot = ExaminationSlot(
        exam_id=exam.exam_id,
        examiner_id=examiner.examiner_id,
        date=slot_date,
        start_time=start_time,
        end_time=end_time,
        max_student_capacity=capacity,
        available_seats=capacity,
        status="available",
        meet_link=body.get("meet_link")
    )

    db.session.add(slot)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Examination slot created successfully.",
        "slot_id": slot.slot_id
    }), 201


# =========================================================
# 5. UPDATE SLOT
# PUT /api/examiner/slots/<slot_id>
# =========================================================

@app.route(
    "/api/examiner/slots/<int:slot_id>",
    methods=["PUT"]
)
@auth_required("token")
@roles_required("examiner")
def update_examiner_slot(slot_id):
    examiner, error = get_assigned_examiner_or_error()
    if error:
        return error

    slot = db.session.get(ExaminationSlot, slot_id)

    if not examiner_owns_slot(examiner, slot):
        return jsonify({
            "success": False,
            "message": "Slot not found or not assigned to you."
        }), 404

    if booking_has_started(slot.examination, slot):
        return jsonify({
            "success": False,
            "message": "Slots cannot be changed after booking starts."
        }), 403

    if not slot_creation_is_open(slot.examination):
        return jsonify({
            "success": False,
            "message": "Slot changes are currently closed."
        }), 403

    body = request.get_json(silent=True) or {}

    try:
        new_date = date.fromisoformat(
            body.get("date", str(slot.date))
        )
        new_start = time.fromisoformat(
            body.get("start_time", slot.start_time.strftime("%H:%M"))
        )
        new_end = time.fromisoformat(
            body.get("end_time", slot.end_time.strftime("%H:%M"))
        )
        new_capacity = int(
            body.get(
                "max_student_capacity",
                slot.max_student_capacity
            )
        )
    except (ValueError, TypeError, AttributeError):
        return jsonify({
            "success": False,
            "message": "Invalid date, time or capacity."
        }), 400

    if new_end <= new_start or new_capacity < 1:
        return jsonify({
            "success": False,
            "message": "Check the slot times and capacity."
        }), 400

    # Never reduce capacity below existing reservations.
    existing_bookings = Booking.query.filter_by(
        slot_id=slot.slot_id
    ).count()

    if new_capacity < existing_bookings:
        return jsonify({
            "success": False,
            "message": (
                "Capacity cannot be lower than the number "
                "of existing bookings."
            )
        }), 400

    overlap = ExaminationSlot.query.filter(
        ExaminationSlot.examiner_id == examiner.examiner_id,
        ExaminationSlot.date == new_date,
        ExaminationSlot.slot_id != slot.slot_id,
        ExaminationSlot.start_time < new_end,
        ExaminationSlot.end_time > new_start
    ).first()

    if overlap:
        return jsonify({
            "success": False,
            "message": "This slot overlaps with another slot."
        }), 409

    slot.date = new_date
    slot.start_time = new_start
    slot.end_time = new_end
    slot.max_student_capacity = new_capacity
    slot.available_seats = new_capacity - existing_bookings
    slot.meet_link = body.get("meet_link", slot.meet_link)

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Examination slot updated successfully."
    }), 200


# =========================================================
# 6. DELETE SLOT
# DELETE /api/examiner/slots/<slot_id>
# =========================================================

@app.route(
    "/api/examiner/slots/<int:slot_id>",
    methods=["DELETE"]
)
@auth_required("token")
@roles_required("examiner")
def delete_examiner_slot(slot_id):
    examiner, error = get_assigned_examiner_or_error()
    if error:
        return error

    slot = db.session.get(ExaminationSlot, slot_id)

    if not examiner_owns_slot(examiner, slot):
        return jsonify({
            "success": False,
            "message": "Slot not found or not assigned to you."
        }), 404

    if booking_has_started(slot.examination, slot):
        return jsonify({
            "success": False,
            "message": "Slots cannot be removed after booking starts."
        }), 403

    if not slot_creation_is_open(slot.examination):
        return jsonify({
            "success": False,
            "message": "Slot changes are currently closed."
        }), 403

    db.session.delete(slot)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Examination slot removed successfully."
    }), 200


# =========================================================
# 7. VIEW STUDENTS BOOKED INTO EXAMINER'S SLOTS
# GET /api/examiner/bookings
# =========================================================

@app.route("/api/examiner/bookings", methods=["GET"])
@auth_required("token")
@roles_required("examiner")
def examiner_bookings():
    examiner, error = get_assigned_examiner_or_error()
    if error:
        return error

    slots = ExaminationSlot.query.filter_by(
        examiner_id=examiner.examiner_id
    ).all()

    slot_ids = [slot.slot_id for slot in slots]

    bookings = (
        Booking.query.filter(
            Booking.slot_id.in_(slot_ids)
        ).order_by(
            Booking.booking_id.desc()
        ).all()
        if slot_ids else []
    )

    return jsonify({
        "success": True,
        "bookings": [
            serialize_booking(booking)
            for booking in bookings
        ]
    }), 200


# =========================================================
# 8. GET RUBRICS FOR AN ASSIGNED EXAMINATION
# GET /api/examiner/examinations/<exam_id>/rubrics
# =========================================================

@app.route(
    "/api/examiner/examinations/<int:exam_id>/rubrics",
    methods=["GET"]
)
@auth_required("token")
@roles_required("examiner")
def examiner_get_rubrics(exam_id):
    examiner, error = get_assigned_examiner_or_error()
    if error:
        return error

    if not examiner_has_assigned_exam(examiner, exam_id):
        return jsonify({
            "success": False,
            "message": "You are not assigned to this examination."
        }), 403

    exam = db.session.get(Examination, exam_id)

    if exam is None:
        return jsonify({
            "success": False,
            "message": "Examination not found."
        }), 404

    rubrics = ExaminationRubric.query.filter_by(
        exam_id=exam_id
    ).all()

    return jsonify({
        "success": True,
        "rubrics": [
            {
                "rubric_id": rubric.rubric_id,
                "exam_id": rubric.exam_id,
                "criterion_name": rubric.criterion_name,
                "max_marks": rubric.max_marks,
                "rubric_weightage": rubric.rubric_weightage,
                "description": rubric.description
            }
            for rubric in rubrics
        ]
    }), 200


# =========================================================
# 9. SUBMIT STUDENT EVALUATION
# POST /api/examiner/bookings/<booking_id>/evaluation
# =========================================================

@app.route(
    "/api/examiner/bookings/<int:booking_id>/evaluation",
    methods=["POST"]
)
@auth_required("token")
@roles_required("examiner")
def examiner_submit_evaluation(booking_id):
    examiner, error = get_assigned_examiner_or_error()
    if error:
        return error

    booking = db.session.get(Booking, booking_id)

    if booking is None:
        return jsonify({
            "success": False,
            "message": "Booking not found."
        }), 404

    slot = booking.slot

    if not examiner_owns_slot(examiner, slot):
        return jsonify({
            "success": False,
            "message": "This booking is not assigned to you."
        }), 403

    body = request.get_json(silent=True) or {}
    submitted_marks = body.get("marks", [])
    remarks = (body.get("remarks") or "").strip()

    if not isinstance(submitted_marks, list) or not submitted_marks:
        return jsonify({
            "success": False,
            "message": "Marks for the rubric criteria are required."
        }), 400

    rubrics = ExaminationRubric.query.filter_by(
        exam_id=slot.exam_id
    ).all()

    rubric_by_id = {
        rubric.rubric_id: rubric
        for rubric in rubrics
    }

    if not rubrics:
        return jsonify({
            "success": False,
            "message": "No rubric is configured for this examination."
        }), 400

    received_ids = set()
    marks_obtained = 0.0

    for item in submitted_marks:
        if not isinstance(item, dict):
            return jsonify({
                "success": False,
                "message": "Invalid rubric marks format."
            }), 400

        rubric_id = item.get("rubric_id")

        if rubric_id not in rubric_by_id:
            return jsonify({
                "success": False,
                "message": "A submitted rubric does not belong to this exam."
            }), 400

        if rubric_id in received_ids:
            return jsonify({
                "success": False,
                "message": "Duplicate rubric criterion submitted."
            }), 400

        received_ids.add(rubric_id)

        try:
            mark = float(item.get("marks_obtained"))
            max_mark = float(rubric_by_id[rubric_id].max_marks)
        except (ValueError, TypeError):
            return jsonify({
                "success": False,
                "message": "Marks must be numeric."
            }), 400

        if mark < 0 or mark > max_mark:
            return jsonify({
                "success": False,
                "message": (
                    f"Marks for rubric {rubric_id} must be "
                    f"between 0 and {max_mark}."
                )
            }), 400

        marks_obtained += mark

    if received_ids != set(rubric_by_id.keys()):
        return jsonify({
            "success": False,
            "message": "Submit marks for every rubric criterion."
        }), 400

    evaluation = Evaluation.query.filter_by(
        booking_id=booking.booking_id
    ).first()

    if evaluation is not None and str(
        evaluation.status or ""
    ).lower() in ("submitted", "completed"):
        return jsonify({
            "success": False,
            "message": "This evaluation has already been submitted."
        }), 409

    maximum_marks = sum(
        float(rubric.max_marks or 0)
        for rubric in rubrics
    )

    if evaluation is None:
        evaluation = Evaluation(
            booking_id=booking.booking_id,
            student_id=booking.student_id,
            examiner_id=examiner.examiner_id,
            total_marks=maximum_marks,
            marks_obtained=marks_obtained,
            remarks=remarks,
            evaluation_date=datetime.utcnow(),
            status="submitted"
        )
        db.session.add(evaluation)
    else:
        evaluation.total_marks = maximum_marks
        evaluation.marks_obtained = marks_obtained
        evaluation.remarks = remarks
        evaluation.evaluation_date = datetime.utcnow()
        evaluation.status = "submitted"

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Evaluation submitted successfully.",
        "evaluation_id": evaluation.evaluation_id,
        "marks_obtained": marks_obtained,
        "total_marks": maximum_marks
    }), 200


# =========================================================
# 10. MARK EXAMINATION AS COMPLETED
# PATCH /api/examiner/examinations/<exam_id>/status
# =========================================================

@app.route(
    "/api/examiner/examinations/<int:exam_id>/status",
    methods=["PATCH"]
)
@auth_required("token")
@roles_required("examiner")
def examiner_update_exam_status(exam_id):
    examiner, error = get_assigned_examiner_or_error()
    if error:
        return error

    if not examiner_has_assigned_exam(examiner, exam_id):
        return jsonify({
            "success": False,
            "message": "You are not assigned to this examination."
        }), 403

    exam = db.session.get(Examination, exam_id)

    if exam is None:
        return jsonify({
            "success": False,
            "message": "Examination not found."
        }), 404

    body = request.get_json(silent=True) or {}
    new_status = str(
        body.get("exam_status", "")
    ).strip().lower()

    if new_status != "completed":
        return jsonify({
            "success": False,
            "message": "Examiner can only mark the examination completed."
        }), 400

    exam.exam_status = "completed"
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Examination marked as completed."
    }), 200


# ------------------- Studnet Area ----------------------


# ============================================================
# COMMON HELPERS
# ============================================================

def get_current_student():
    """
    Find the Student profile linked to the logged-in User.
    """
    return Student.query.filter_by(
        user_id=current_user.id
    ).first()


def student_error_response():
    return jsonify({
        "success": False,
        "message": "Student profile not found."
    }), 404


def is_active_booking(booking):
    """
    Statuses that represent a current booking.
    """
    return str(booking.booking_status or "").lower() not in [
        "cancelled",
        "canceled",
        "rejected"
    ]


def is_exam_booking_open(exam):
    """
    Uses the admin-controlled student_booking_open field.
    """
    return bool(
        getattr(exam, "student_booking_open", False)
    )


def is_exam_result_published(exam):
    """
    Results are hidden until the admin publishes them.
    """
    return bool(
        getattr(exam, "results_published", False)
    )


def serialize_exam(exam):
    return {
        "exam_id": exam.exam_id,
        "exam_name": exam.exam_name,
        "course_id": exam.course_id,
        "course_name": (
            exam.course.course_name
            if exam.course else None
        ),
        "exam_type": exam.exam_type,
        "duration": exam.duration,
        "max_marks": exam.max_marks,
        "exam_status": exam.exam_status,
        "booking_open": is_exam_booking_open(exam)
    }


def serialize_slot(slot):
    exam = slot.examination

    examiner_name = None

    if slot.examiner and slot.examiner.user:
        examiner_name = slot.examiner.user.username

    return {
        "slot_id": slot.slot_id,
        "exam_id": slot.exam_id,
        "exam_name": exam.exam_name if exam else None,
        "date": (
            slot.date.isoformat()
            if slot.date else None
        ),
        "start_time": (
            slot.start_time.strftime("%H:%M")
            if slot.start_time else None
        ),
        "end_time": (
            slot.end_time.strftime("%H:%M")
            if slot.end_time else None
        ),
        "examiner_id": slot.examiner_id,
        "examiner_name": examiner_name,
        "max_student_capacity": slot.max_student_capacity,
        "available_seats": slot.available_seats,
        "status": slot.status
    }


def serialize_booking(booking):
    slot = booking.slot
    exam = slot.examination if slot else None

    examiner_name = None

    if slot and slot.examiner and slot.examiner.user:
        examiner_name = slot.examiner.user.username

    evaluation = Evaluation.query.filter_by(
        booking_id=booking.booking_id
    ).first()

    can_cancel = False

    if slot and slot.date and slot.start_time:
        exam_datetime = datetime.combine(
            slot.date,
            slot.start_time
        )

        # Default cancellation deadline:
        # 24 hours before the examination.
        cancellation_deadline_hours = int(
            getattr(exam, "cancellation_deadline_hours", 24)
            if exam else 24
        )

        cancellation_deadline = exam_datetime - timedelta(
            hours=cancellation_deadline_hours
        )

        can_cancel = (
            is_active_booking(booking)
            and datetime.now() < cancellation_deadline
        )

    return {
        "booking_id": booking.booking_id,
        "student_id": booking.student_id,
        "slot_id": booking.slot_id,
        "exam_id": slot.exam_id if slot else None,
        "exam_name": exam.exam_name if exam else None,
        "course_name": (
            exam.course.course_name
            if exam and exam.course else None
        ),
        "date": (
            slot.date.isoformat()
            if slot and slot.date else None
        ),
        "start_time": (
            slot.start_time.strftime("%H:%M")
            if slot and slot.start_time else None
        ),
        "end_time": (
            slot.end_time.strftime("%H:%M")
            if slot and slot.end_time else None
        ),
        "examiner_name": examiner_name,
        "booking_status": booking.booking_status,
        "evaluation_status": (
            evaluation.status if evaluation else "pending"
        ),
        "can_cancel": can_cancel
    }


# ============================================================
# 1. STUDENT DASHBOARD
# GET /api/student/dashboard
# ============================================================

@app.route(
    "/api/student/dashboard",
    methods=["GET"]
)
@auth_required("token")
@roles_required("student")
def student_dashboard():

    student = get_current_student()

    if not student:
        return student_error_response()

    today = date.today()

    # Available examinations
    examinations = Examination.query.filter_by(
        exam_status="active"
    ).all()

    available_examinations = [
        exam for exam in examinations
        if is_exam_booking_open(exam)
    ]

    # Available slots
    all_slots = ExaminationSlot.query.filter(
        ExaminationSlot.status == "available",
        ExaminationSlot.available_seats > 0,
        ExaminationSlot.date >= today
    ).all()

    available_slots = [
        slot for slot in all_slots
        if slot.examination
        and is_exam_booking_open(slot.examination)
    ]

    # Student's bookings
    bookings = Booking.query.filter_by(
        student_id=student.student_id
    ).all()

    active_bookings = [
        booking for booking in bookings
        if is_active_booking(booking)
    ]

    upcoming_examinations = [
        booking for booking in active_bookings
        if booking.slot
        and booking.slot.date
        and booking.slot.date >= today
    ]

    return jsonify({
        "success": True,
        "stats": {
            "available_examinations": len(
                available_examinations
            ),
            "available_slots": len(available_slots),
            "upcoming_examinations": len(
                upcoming_examinations
            ),
            "booked_examinations": len(active_bookings)
        }
    }), 200


# ============================================================
# 2. GET AVAILABLE EXAMINATIONS
# GET /api/student/examinations
# ============================================================

@app.route(
    "/api/student/examinations",
    methods=["GET"]
)
@auth_required("token")
@roles_required("student")
def student_examinations():

    student = get_current_student()

    if not student:
        return student_error_response()

    examinations = Examination.query.filter_by(
        exam_status="active"
    ).all()

    return jsonify({
        "success": True,
        "examinations": [
            serialize_exam(exam)
            for exam in examinations
        ]
    }), 200


# ============================================================
# 3. GET AVAILABLE SLOTS
# GET /api/student/slots
# ============================================================

@app.route(
    "/api/student/slots",
    methods=["GET"]
)
@auth_required("token")
@roles_required("student")
def student_available_slots():

    student = get_current_student()

    if not student:
        return student_error_response()

    today = date.today()

    slots = ExaminationSlot.query.filter(
        ExaminationSlot.status == "available",
        ExaminationSlot.available_seats > 0,
        ExaminationSlot.date >= today
    ).order_by(
        ExaminationSlot.date.asc(),
        ExaminationSlot.start_time.asc()
    ).all()

    available_slots = []

    for slot in slots:

        exam = slot.examination

        if not exam:
            continue

        if exam.exam_status != "active":
            continue

        if not is_exam_booking_open(exam):
            continue

        available_slots.append(
            serialize_slot(slot)
        )

    return jsonify({
        "success": True,
        "slots": available_slots
    }), 200


# ============================================================
# 4. BOOK AN EXAMINATION SLOT
# POST /api/student/slots/<slot_id>/book
# ============================================================

@app.route(
    "/api/student/slots/<int:slot_id>/book",
    methods=["POST"]
)
@auth_required("token")
@roles_required("student")
def book_exam_slot(slot_id):

    student = get_current_student()

    if not student:
        return student_error_response()

    try:
        # Lock the slot row while checking capacity.
        slot = (
            ExaminationSlot.query
            .filter_by(slot_id=slot_id)
            .with_for_update()
            .first()
        )

        if not slot:
            return jsonify({
                "success": False,
                "message": "Examination slot not found."
            }), 404

        exam = slot.examination

        if not exam:
            return jsonify({
                "success": False,
                "message": "Examination not found."
            }), 404

        if exam.exam_status != "active":
            return jsonify({
                "success": False,
                "message": "This examination is not active."
            }), 403

        if not is_exam_booking_open(exam):
            return jsonify({
                "success": False,
                "message": "Student booking is currently closed."
            }), 403

        if slot.status != "available":
            return jsonify({
                "success": False,
                "message": "This slot is not available."
            }), 400

        if slot.available_seats <= 0:
            return jsonify({
                "success": False,
                "message": "No seats are available in this slot."
            }), 409

        # Prevent booking another slot for the same examination.
        existing_exam_booking = (
            db.session.query(Booking)
            .join(
                ExaminationSlot,
                Booking.slot_id == ExaminationSlot.slot_id
            )
            .filter(
                Booking.student_id == student.student_id,
                ExaminationSlot.exam_id == exam.exam_id
            )
            .all()
        )

        if any(
            is_active_booking(booking)
            for booking in existing_exam_booking
        ):
            return jsonify({
                "success": False,
                "message": (
                    "You already have an active booking "
                    "for this examination."
                )
            }), 409

        # Check if this exact slot was previously booked.
        existing_booking = Booking.query.filter_by(
            student_id=student.student_id,
            slot_id=slot.slot_id
        ).first()

        if existing_booking:
            if is_active_booking(existing_booking):
                return jsonify({
                    "success": False,
                    "message": "You have already booked this slot."
                }), 409

            # Reactivate a previously cancelled booking.
            existing_booking.booking_status = "confirmed"
            booking = existing_booking

        else:
            booking = Booking(
                student_id=student.student_id,
                slot_id=slot.slot_id,
                booking_status="confirmed"
            )

            db.session.add(booking)

        slot.available_seats -= 1

        if slot.available_seats == 0:
            slot.status = "full"

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Examination slot booked successfully.",
            "booking_id": booking.booking_id
        }), 201

    except IntegrityError:
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "This slot has already been booked."
        }), 409

    except Exception:
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to book this examination slot."
        }), 500


# ============================================================
# 5. GET STUDENT BOOKINGS
# GET /api/student/bookings
# ============================================================

@app.route(
    "/api/student/bookings",
    methods=["GET"]
)
@auth_required("token")
@roles_required("student")
def student_bookings():

    student = get_current_student()

    if not student:
        return student_error_response()

    bookings = Booking.query.filter_by(
        student_id=student.student_id
    ).order_by(
        Booking.booking_id.desc()
    ).all()

    active_bookings = [
        booking for booking in bookings
        if is_active_booking(booking)
    ]

    return jsonify({
        "success": True,
        "bookings": [
            serialize_booking(booking)
            for booking in active_bookings
        ]
    }), 200


# ============================================================
# 6. CANCEL BOOKING
# PATCH /api/student/bookings/<booking_id>/cancel
# ============================================================

@app.route(
    "/api/student/bookings/<int:booking_id>/cancel",
    methods=["PATCH"]
)
@auth_required("token")
@roles_required("student")
def cancel_student_booking(booking_id):

    student = get_current_student()

    if not student:
        return student_error_response()

    booking = Booking.query.filter_by(
        booking_id=booking_id,
        student_id=student.student_id
    ).first()

    if not booking:
        return jsonify({
            "success": False,
            "message": "Booking not found."
        }), 404

    if not is_active_booking(booking):
        return jsonify({
            "success": False,
            "message": "This booking is already cancelled."
        }), 400

    slot = booking.slot
    exam = slot.examination if slot else None

    if not slot or not slot.date or not slot.start_time:
        return jsonify({
            "success": False,
            "message": "Invalid examination slot."
        }), 400

    exam_datetime = datetime.combine(
        slot.date,
        slot.start_time
    )

    cancellation_deadline_hours = int(
        getattr(exam, "cancellation_deadline_hours", 24)
        if exam else 24
    )

    cancellation_deadline = exam_datetime - timedelta(
        hours=cancellation_deadline_hours
    )

    if datetime.now() >= cancellation_deadline:
        return jsonify({
            "success": False,
            "message": (
                "Cancellation deadline has passed. "
                "You can no longer cancel this booking."
            )
        }), 403

    try:
        booking.booking_status = "cancelled"

        slot.available_seats = min(
            slot.max_student_capacity,
            slot.available_seats + 1
        )

        if slot.status == "full":
            slot.status = "available"

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Booking cancelled successfully."
        }), 200

    except Exception:
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to cancel booking."
        }), 500


# ============================================================
# 7. BOOKING HISTORY
# GET /api/student/history
# ============================================================

@app.route(
    "/api/student/history",
    methods=["GET"]
)
@auth_required("token")
@roles_required("student")
def student_booking_history():

    student = get_current_student()

    if not student:
        return student_error_response()

    bookings = Booking.query.filter_by(
        student_id=student.student_id
    ).order_by(
        Booking.booking_id.desc()
    ).all()

    return jsonify({
        "success": True,
        "history": [
            serialize_booking(booking)
            for booking in bookings
        ]
    }), 200


# ============================================================
# 8. PUBLISHED RESULTS
# GET /api/student/results
# ============================================================

@app.route(
    "/api/student/results",
    methods=["GET"]
)
@auth_required("token")
@roles_required("student")
def student_results():

    student = get_current_student()

    if not student:
        return student_error_response()

    bookings = Booking.query.filter_by(
        student_id=student.student_id
    ).all()

    results = []

    for booking in bookings:

        evaluation = Evaluation.query.filter_by(
            booking_id=booking.booking_id
        ).first()

        if not evaluation:
            continue

        slot = booking.slot
        exam = slot.examination if slot else None

        if not exam:
            continue

        # Do not expose unpublished results.
        if not is_exam_result_published(exam):
            continue

        if str(evaluation.status or "").lower() not in [
            "submitted",
            "completed",
            "published"
        ]:
            continue

        results.append({
            "evaluation_id": evaluation.evaluation_id,
            "booking_id": booking.booking_id,
            "exam_id": exam.exam_id,
            "exam_name": exam.exam_name,
            "course_name": (
                exam.course.course_name
                if exam.course else None
            ),
            "marks_obtained": evaluation.marks_obtained,
            "total_marks": evaluation.total_marks,
            "remarks": evaluation.remarks,
            "evaluation_date": (
                evaluation.evaluation_date.isoformat()
                if evaluation.evaluation_date else None
            ),
            "status": evaluation.status
        })

    return jsonify({
        "success": True,
        "results": results
    }), 200


# ============================================================
# 9. GET STUDENT PROFILE
# GET /api/student/profile
# ============================================================

@app.route(
    "/api/student/profile",
    methods=["GET"]
)
@auth_required("token")
@roles_required("student")
def get_student_profile():

    student = get_current_student()

    if not student:
        return student_error_response()

    user = User.query.get(current_user.id)

    return jsonify({
        "success": True,
        "profile": {
            "student_id": student.student_id,
            "user_id": user.id,
            "username": user.username,
            "email": user.email
        }
    }), 200


# ============================================================
# 10. UPDATE STUDENT PROFILE
# PUT /api/student/profile
# ============================================================

@app.route(
    "/api/student/profile",
    methods=["PUT"]
)
@auth_required("token")
@roles_required("student")
def update_student_profile():

    student = get_current_student()

    if not student:
        return student_error_response()

    user = User.query.get(current_user.id)

    body = request.get_json(silent=True) or {}

    username = body.get("username")
    email = body.get("email")
    new_password = body.get("new_password")

    if not username or not email:
        return jsonify({
            "success": False,
            "message": "Username and email are required."
        }), 400

    username = username.strip()
    email = email.strip().lower()

    if len(username) < 3:
        return jsonify({
            "success": False,
            "message": "Username must contain at least 3 characters."
        }), 400

    if "@" not in email:
        return jsonify({
            "success": False,
            "message": "Enter a valid email address."
        }), 400

    existing_email = User.query.filter(
        User.email == email,
        User.id != user.id
    ).first()

    if existing_email:
        return jsonify({
            "success": False,
            "message": "This email address is already registered."
        }), 409

    try:
        user.username = username
        user.email = email

        if new_password:
            if len(new_password) < 8:
                return jsonify({
                    "success": False,
                    "message": (
                        "New password must contain at least "
                        "8 characters."
                    )
                }), 400

            user.password = generate_password_hash(new_password)

        user.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Profile updated successfully."
        }), 200

    except IntegrityError:
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "Username or email already exists."
        }), 409

    except Exception:
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to update profile."
        }), 500


from .register import *