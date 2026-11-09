#### 1. Python ->  python3 app.py
#### 2.celery -A app.celery worker --loglevel=info 
#### 3.celery -A app.celery beat --loglevel=info
#### 4.Redis ->sudo systemctl start redis-server , verify -> redis-cli ping, Close->sudo systemctl stop redis-server
#### 5.sudo docker logs -f mailhog --> go/Mailhog
