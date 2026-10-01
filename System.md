# First work is to design the Class Architecture of The whole System how it will communicate within the app


### Sign UP --> Creation of New account/User. 
### ---> ID : --- ### not needed since there is no logic to take it in frontend from user
### --> Name : ----
### --->Extra Details:----
### ---> password:---


# Neet --> NEET4583939
# GATE --> GATE147147014

## __> Admin can block/unblock -- for active column



# System Design

# 📚 Examination Management System

## 1. Course

> 🔒 **Access:** **Admin Only**
> Students and Examiners **cannot modify** this entity.

| Field           | Source / Access |
| --------------- | --------------- |
| **Course ID**   | Backend         |
| **Course Code** | Backend         |
| **Course Name** | Frontend        |
| **Description** | Frontend        |
| **Status**      | Backend        |

---

## 2. Examination

> 🔒 **Access:** **Admin Only**

| Field                        | Source / Type          |
| ---------------------------- | ---------------------- |
| **Exam ID**                  | Backend                |
| **Course ID**                | Foreign Key → `Course` |
| **Examination Name**         | Frontend               |
| **Examination Type**         | Frontend               |
| **Duration**                 | Frontend               |
| **Maximum Marks**            | Frontend               |
| **Slot Creation Start Date** | Frontend               |
| **Slot Creation End Date**   | Frontend               |
| **Slot Booking Start Date**  | Frontend               |
| **Slot Booking End Date**    | Frontend               |
| **Examination Status**       | Frontend               |

### Examination Type

* Viva
* Practical
* Project Demo
* Assessment

### Examination Status

* Draft
* Slot Creation
* Booking Open
* Closed
* Completed

---

## 3. Examination Rubric

> 🔐 **Access:** **Examiner and Admin Only**

| Field              | Source / Type               |
| ------------------ | --------------------------- |
| **Rubric ID**      | Backend                     |
| **Examination ID** | Foreign Key → `Examination` |
| **Criterion Name** | Frontend                    |
| **Maximum Marks**  | Frontend                    |
| **Weightage**      | Frontend                    |
| **Description**    | Frontend                    |

---

## 4. Examination Slot

> 🔐 **Access:** **Examiner and Admin Only**

| Field                        | Source / Type               |
| ---------------------------- | --------------------------- |
| **Slot ID**                  | Backend                     |
| **Examination ID**           | Foreign Key → `Examination` |
| **Examiner ID**              | Foreign Key → `Examiner`    |
| **Date**                     | Frontend                    |
| **Start Time**               | Frontend                    |
| **End Time**                 | Frontend                    |
| **Maximum Student Capacity** | Frontend                    |
| **Available Seats**          | Frontend                    |
| **Status**                   | Frontend                    |
| **Meeting Link**             | Optional — Frontend         |

### Slot Status

* Available
* Full
* Cancelled
* Completed

> **Note:** An **Examiner Table** needs to be implemented. The `Examiner ID` will be fetched from this table and used as a foreign key.

---

## 5. Booking

| Access Level     | Permissions      |
| ---------------- | ---------------- |
| 👑 **Admin**     | All access       |
| 👁️ **Examiner** | View access only |

| Field            | Source / Type                    |
| ---------------- | -------------------------------- |
| **Booking ID**   | Backend                          |
| **Student ID**   | Foreign Key → `Student`          |
| **Slot ID**      | Foreign Key → `Examination Slot` |
| **Booking Date** | Frontend                         |
| **Status**       | Frontend                         |

### Booking Status

* Booked
* Cancelled
* Completed

> **Note:** A **Student Table** needs to be implemented. The `Student ID` will be fetched from this table and used as a foreign key.

---

## 6. Evaluation

> 🔐 **Access:** **Examiner Only**

| Field               | Source / Type                                                                   |
| ------------------- | ------------------------------------------------------------------------------- |
| **Evaluation ID**   | Backend                                                                         |
| **Booking ID**      | Foreign Key → `Examination Slot`                                                |
| **Student ID**      | Foreign Key → `Student`                                                         |
| **Examiner ID**     | Foreign Key → `Examiner`                                                        |
| **Total Marks**     | Relationship with `Examination Rubric`; data to be fetched is **Maximum Marks** |
| **Remarks**         | Frontend                                                                        |
| **Evaluation Date** | Backend — `datetime`                                                            |
| **Status**          | Frontend                                                                        |

---

# 👨‍🎓 Student Table

The **Student Table** is inherited from the `USER` table.

| Field            | Relationship / Description         |
| ---------------- | ---------------------------------- |
| **Name**         | `user.Username`                    |
| **ID**           | Foreign Key → `users`              |
| **Extra Fields** | Additional student-specific fields |

---

# 👨‍🏫 Examiner Table

The **Examiner Table** is inherited from the `USER` table.

| Field            | Relationship / Description          |
| ---------------- | ----------------------------------- |
| **Name**         | `user.Username`                     |
| **ID**           | Foreign Key → `users`               |
| **Extra Fields** | Additional examiner-specific fields |

---

# 🔗 Entity Relationships

```text
USER
 ├── Student
 │     │
 │     └──────────────┐
 │                    │
 └── Examiner         │
       │              │
       │              │
       ▼              ▼
   Examination Slot ◄── Booking
       │                  │
       │                  │
       ▼                  ▼
  Examination         Evaluation
       │                  │
       ▼                  │
 Examination Rubric ◄─────┘
       │
       ▼
     Course
```

### Main Foreign-Key Relationships

| Entity                 | Relationship                      |
| ---------------------- | --------------------------------- |
| **Examination**        | `Course ID` → `Course`            |
| **Examination Rubric** | `Examination ID` → `Examination`  |
| **Examination Slot**   | `Examination ID` → `Examination`  |
| **Examination Slot**   | `Examiner ID` → `Examiner`        |
| **Booking**            | `Student ID` → `Student`          |
| **Booking**            | `Slot ID` → `Examination Slot`    |
| **Evaluation**         | `Booking ID` → `Examination Slot` |
| **Evaluation**         | `Student ID` → `Student`          |
| **Evaluation**         | `Examiner ID` → `Examiner`        |
| **Student**            | `ID` → `users`                    |
| **Examiner**           | `ID` → `users`                    |


#----------------------------------------------------------------------------------------------------------------------------------
    
