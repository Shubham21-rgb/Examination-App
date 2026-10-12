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
    