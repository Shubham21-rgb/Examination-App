from flask import Flask
from application.database import db
from application.models import *
from application.config import LocalDevelopmentConfig
from flask_security import Security,SQLAlchemyUserDatastore
from werkzeug.security import generate_password_hash
#from application.resources import api
# from application.celery_init import celery_init_app
#from celery.schedules import crontab
#here we will use the hash password for encrypting the password
from flask_security import hash_password
# from flask_caching import Cache

# Redis cache setup
# cache = Cache(config={
#     "CACHE_TYPE": "RedisCache",
#     "CACHE_DEFAULT_TIMEOUT": 60,  # 1 minute default
#     "CACHE_REDIS_URL": "redis://localhost:6379/0"
# })
def create_app():
    app=Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    #api.init_app(app)
    #cache.init_app(app)
    datastore=SQLAlchemyUserDatastore(db,User,Role)
    app.security=Security(app,datastore)
    app.app_context().push()
    return app
app=create_app()
#celery=celery_init_app(app)
#celery.autodiscover_tasks()

with app.app_context():
    db.create_all()

    app.security.datastore.find_or_create_role(name="admin",description="super user of app ")
    app.security.datastore.find_or_create_role(name="examiner",description="examiner status user of app ")
    app.security.datastore.find_or_create_role(name="student",description="student status user of app ")
    db.session.commit()
    if not app.security.datastore.find_user(email="Mastercontrol@admin.com"):
        app.security.datastore.create_user(username="MasterAdmin",
                                           email="Mastercontrol@admin.com",
                                           password=generate_password_hash("12345"),
                                           roles=['admin'])
    if not app.security.datastore.find_user(email="RaviKisan@gmail.com"):
        app.security.datastore.create_user(username="Ravi21",
                                           email="RaviKisan@gmail.com",
                                           password=generate_password_hash("Hotis1234"),
                                           roles=['examiner'])
    if not app.security.datastore.find_user(email="demostudent@gmail.com"):
            app.security.datastore.create_user(username="Rahi",
                                               email="demostudent@gmail.com",
                                               password=generate_password_hash("Hotis1234"),
                                               roles=['student'])
                                           
    db.session.commit()
from application.routes import *



# @celery.on_after_finalize.connect 
# def setup_periodic_tasks(sender, **kwargs):
#     sender.add_periodic_task(
#         crontab(minute = '*/1'),
#         monthly_report.s(),
#     )
if __name__=="__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

#pip3 install --upgrade setuptools


# Lets make this as suppose the Examiner Registers himself then how can you make 
# this feature available such that when it registers the information 
# should be stored in users as well as examiner
