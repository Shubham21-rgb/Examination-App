# First work is to design the Class Architecture of The whole System how it will communicate within the app


### Sign UP --> Creation of New account/User. 
### ---> ID : --- ### not needed since there is no logic to take it in frontend from user
### --> Name : ----
### --->Extra Details:----
### ---> password:---


# Neet --> NEET4583939
# GATE --> GATE147147014

## __> Admin can block/unblock -- for active column



## System Design

1.Course--> 
Admin (this cannot be touched by student,Examiner) 
Feilds:
Course ID --> bck
Course Code --> bck
Course Name  --> Frontend
Description --> Frontend
Status --> Frontend
2.Examination --> Admin Only
Exam ID --> bck
Course ID --> foreign key(Course)
Examination Name --> frontend
Examination Type (Viva / Practical / Project Demo / Assessment) -->frontend
Duration -->frontend
Maximum Marks -->frontend
Slot Creation Start Date -->frontend
Slot Creation End Date -->frontend
Slot Booking Start Date -->frontend
Slot Booking End Date -->frontend
Examination Status (Draft / Slot Creation / Booking Open / Closed / Completed) -->frontend

3.Examination Rubric --> Examiner and Admin Only
Rubric ID --> bck
Examination ID --> foreign key(Examination)
Criterion Name -->frontend
Maximum Marks  -->frontend
Weightage -->frontend
Description -->frontend

4.Examination Slot -->Examiner and Admin Only
Slot ID --> bck
Examination ID --> foreign key(Examination)
Examiner ID --> Need to implement Examiner Table and fetch that id as a foreign key
Date -->frontend
Start Time -->frontend
End Time-->frontend
Maximum Student Capacity-->frontend
Available Seats-->frontend
Status (Available / Full / Cancelled / Completed)-->frontend
Meeting Link (Optional)-->frontend

5.Booking:Admin(all access) and examiner(only view access)
Booking ID --> bck 
Student ID --> Need to implement Studnet Table and fetch that id as a foreign key
Slot ID -->foreign key(Examination Slot)
Booking Date -->frontend
Status (Booked / Cancelled / Completed)-->frontend

6.Evaluation --> Only Examiner
Evaluation ID --> bck
Booking ID -->foreign key(Examination Slot)
Student ID --> Need to implement Studnet Table and fetch that id as a foreign key
Examiner ID --> Need to implement Examiner Table and fetch that id as a foreign key
Total Marks --> Relationship with Examination Rubric and the data to be fetched is Max Marks
Remarks --> frontend
Evaluation Date --> bck (datetime)
Status --> frontend

7.
Student Table --> Inherited from USER
Name: user.Username
id: ForeignKey(users)
extra feilds


8.
Examiner Table --> Inherited from USER
Name: user.Username
id=ForeignKey(users)
extraFeilds

#----------------------------------------------------------------------------------------------------------------------------------
    
