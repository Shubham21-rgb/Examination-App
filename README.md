# Examination Application

An automated, role-based Online Examination Platform designed to handle high-concurrency exam delivery, real-time proctoring, and automated evaluation. This application features dedicated interfaces for **Students**, **Teachers**, and **Admins**, leveraging a modern decoupled architecture.

---

## 🚀 Technology Stack

*   **Frontend:** [Vue.js](https://vuejs.org/) (Vue 3, Pinia for state management, Vue Router, Tailwind CSS)
*   **Backend API:** [Flask](https://flask.palletsprojects.com/) (Python-based RESTful API, Flask-SQLAlchemy)
*   **Task Queue & Asynchronous Processing:** [Celery](https://docs.celeryq.dev/)
*   **Message Broker & In-Memory Database:** [Redis](https://redis.io/)
*   **Database:** PostgreSQL (or MySQL / SQLite for development)

---

## 👥 Role Architecture & Features

The system manages interactions seamlessly across three critical system actors:

### 1. 🎓 Student Portal
*   **Exam Interface:** Secure, full-screen examination environment with strict countdown timers synchronized with the server.
*   **Auto-Save & Recover:** Answers are continuously synced to local storage and backed up via background API calls to prevent data loss on network drops.
*   **Instant Result Tracking:** Access to graded papers, scoresheets, detailed feedback, and statistical breakdowns once results are published.

### 2. 👩‍🏫 Teacher Portal
*   **Exam Generator:** Comprehensive test creation panel supporting Multiple Choice Questions (MCQs), multi-select, and descriptive text items.
*   **Question Bank Management:** Categorize, tag, and store questions to randomize exam variants for different students automatically.
*   **Grading Matrix:** Review descriptive answers manually alongside auto-calculated MCQ metrics, with the ability to append rich markdown comments.

### 3. 🛡️ Admin Dashboard
*   **System Diagnostics:** Monitor system health, live traffic spikes, active queues inside Redis, and background worker status.
*   **User Management:** Provision, audit, batch-import, or revoke credentials for teachers and students alike.
*   **Curriculum Lifecycle:** Manage macro structures including departments, semesters, specific course modules, and global testing schedules.

---

## ⚙️ Backend Core (Celery & Redis Orchestration)

To remain highly responsive during intensive testing windows, the Flask API offloads resource-heavy operations entirely to **Celery workers**, using **Redis** as the real-time broker.

```
 [ Flask API ] <---- HTTP Requests ----> [ Client Browsers ]
      |
      | (Offloads Heavy/Scheduled Tasks)
      v
 [ Redis Broker ] <====================> [ Celery Workers ]
                                               |
                                               +--> Process Exam Auto-Grading
                                               +--> Generate PDF Certificates
                                               +--> Send Email Alerts
```

*   **Automated Evaluation:** As soon as an exam window closes, Celery aggregates submission packets and processes all MCQ auto-grading pipelines without locking up API resources.
*   **Reporting Pipelines:** Compilation of intensive performance metrics, class analytics, and downloadable PDF reports happen fully in the background.
*   **Rate-Limiting & Session Guards:** Redis serves as an ultra-fast cache to manage concurrent seat allocations, rate-limit excessive API calls, and maintain strict, non-tamperable countdown states.

---

## 🛠️ Project Structure

```text
├──application
     ├── config.py
     ── database.py
     ├── models.py
     ├── routes.py
     └── utils.py(student, teacher, admin)

├──static
     ├── components
     └── script.js Celery workers
     ├── frontend/                 
     │   ├── src/
     │   │   ├── components/       


├──templates
     └── index.html            
       └── store/             
app.py
requirements.txt
README.md
```

---

## 💻 Quickstart Guide

### Prerequisites
*   Python 3.10+
*   Node.js 18+
*   Redis Server (Running locally or via Docker)

### 1. Set Up Redis
Ensure your Redis instance is alive and listening on the default port:
```bash
docker run -d -p 6379:6379 redis:alpine
```

### 2. Configure Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt

# Start the Flask API Server
flask run --port=5000

# In a separate terminal tab, activate venv and spin up Celery
celery -A celery_worker.celery worker --loglevel=info
```
