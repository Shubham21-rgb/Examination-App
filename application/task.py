from celery import shared_task
from .models import User
import time
import datetime
import csv
from .utils import format_report
from .mail import send_email
import requests
from application.database import db
# @shared_task(ignore_result=False,name="download_csv_report")
# def csv_report(pat_id):
#     transactions = Appointment.query.filter_by(patient_id=pat_id) # admin
#     csv_file_name = f"Appoinment_{datetime.datetime.now().strftime("%f")}.csv" #transaction_123456.csv
#     with open(f'static/{csv_file_name}', 'w', newline = "") as csvfile:
#     # csvfile = open(f'static/{csv_file_name}', 'w', newline = "")
#         sr_no = 1
#         trans_csv = csv.writer(csvfile, delimiter = ',')
#         trans_csv.writerow(['Sr No.','Patient id', 'Patient Name', 'Appointment Date', 'Appointment Time', 'Status', ' Reason for Visit','Created At','Doctor in Charge'])
#         for t in transactions:
#             this_trans = [sr_no, t.patient_id,t.patient.user.username, t.appointment_date, t.appointment_time, t.status, t.reason_for_visit, t.created_at, t.doctor.user.username]
#             trans_csv.writerow(this_trans)
#             sr_no += 1

#     return csv_file_name


@shared_task(ignore_result=False, name="monthly_report")
def monthly_report(id):
    today = datetime.date.today()
    info = db.session.get(User, id)
    
    if not info:
        return f"User with id {id} not found"
        
    print("Details are ", info)
    
    data = {
        "username": info.username,
        "password": info.password,
        "time": today.strftime("%Y-%m-%d")
    }
    
    # Initialize the key structure properly before appending
    report_data = {"creds": []}
    report_data['creds'].append(data)
    
    message = format_report('templates/mail_details.html', data=report_data)
    
    if info.email:
        send_email(to_address=info.email, subject="User Credentials", message=message)
        return f"Monthly report sent to {info.email}"
        
    return "Monthly report failed: No email set for user"


# @shared_task(ignore_result=False,name="delivery_update")
# def delivery_report(username):
#     text=f"Hi {username},Check your Dasboard For the Changes From UNITY SERVICES"
#     response=requests.post("https://chat.googleapis.com",json={"text":text})
#     return"The Updated Details send to user"