 Project Documentation - Node.js Educational Platform

 Overview

This Node.js project is part of an online educational platform that provides:

Student login and authentication

Teacher registration and management

Month/class purchasing logic for students

Role-based data access with encryption

It utilizes Express.js, MongoDB, and bcrypt for secure authentication, with a focus on student-teacher interactions.

 Description 

A secure educational backend system designed for managing teachers and students, offering encrypted data handling, subscription control, and mobile device-based access restriction. Teachers can upload educational content, while students can register, sign in, and purchase months/classes.

 Project Structure

project-root/
├── controllers/
│   ├── login.js          # Student sign-in & month purchase logic
│   ├── applicant.js      # Student registration & advanced logic
│   ├── admin.js          # Teacher registration & ID generation
│   └── master.js         # Teacher dashboard features and controls
├── routes/
│   ├── login.js          # Student sign-in & month purchase logic
│   ├── applicant.js      # Student registration & advanced logic
│   ├── admin.js          # Teacher registration & ID generation
│   └── master.js         # Teacher dashboard features and controls
├── models/
│   ├── users.js          # Student model
│   └── teachers.js       # Teacher model
├── utilitie/
│   └── cryptoUtil.js     # Custom encryption/decryption logic
├── server.js             # Express server setup

 Features

 Teacher Registration (admin.js)

Registers a new teacher with:

Encrypted phone number

Auto-generated unique teacher ID

Hashed password using bcrypt

Route: POST /theprof/admin/Create/New/Teacher

 Student Admission (applicant.js)

Student requests registration linked to a teacher

Generates a unique student code

Encrypts student phone numbers

Status-based flow: Waiting, Expired, Active

Routes:

POST /theprof/students/Request/New/Acceptance

POST /theprof/students/GetTeacherDataByCode

POST /theprof/students/BuyMonth

 Student Login (login.js)

Authenticates by:

Validating studentCode and deviceID

Checking if code expired

Verifying assigned teacher exists

Filters:

Available months/classes based on student grade

Decrypts encrypted fields (class titles, URLs, etc.)

Routes:

POST /theprof/students/GetTeacherDataByCode

POST /theprof/students/BuyMonth

 Teacher Panel Features (master.js)

Authentication & Dashboard Management

Student activation, month & lecture management

Notifications and sliders

Routes:

POST /theprof/teachers/login

POST /theprof/teachers/Create/NewStudent

PUT /theprof/teachers/Update/Student

PUT /theprof/teachers/Update/StudentActivationDate

POST /theprof/teachers/Create/Month

POST /theprof/teachers/Create/Lecture

POST /theprof/teachers/Create/Notification

POST /theprof/teachers/Create/Slider

DELETE /theprof/teachers/Delete/Month

DELETE /theprof/teachers/Delete/Lecture

DELETE /theprof/teachers/Delete/Slider

DELETE /theprof/teachers/Delete/Notification

GET /theprof/teachers/see/requested/from/student

POST /theprof/teachers/accept/requested/from/student

 Purchasing Logic (getMonth)

Validates student and teacher

Ensures correct grade and device

Deducts balance and updates purchased months

 Security Highlights

bcrypt for password hashing

AES encryption for sensitive fields like phone numbers

Device-based session validation to prevent misuse

 Installation & Usage

1. Clone Repository

git clone https://github.com/E-AHMED-MUKHTAR/theprof-v2-api-.git

2. Install Dependencies

npm install

3. Create .env

MONGO_URI
SESSION_SECRET

4. Run Server

npm start

 API Endpoints Summary

Route

Method

Description

/theprof/admin/Create/New/Teacher

POST

Register a new teacher

/theprof/students/GetTeacherDataByCode

POST

Login student / fetch teacher data

/theprof/students/BuyMonth

POST

Student purchases a month

/theprof/students/Request/New/Acceptance

POST

Student registration request

/theprof/teachers/login

POST

Teacher login

/theprof/teachers/Create/NewStudent

POST

Create a new student

/theprof/teachers/Update/Student

PUT

Update student info

/theprof/teachers/Update/StudentActivationDate

PUT

Update activation date

/theprof/teachers/Create/Month

POST

Create a new month

/theprof/teachers/Create/Lecture

POST

Create a new lecture

/theprof/teachers/Create/Notification

POST

Create a notification

/theprof/teachers/Create/Slider

POST

Create a slider item

/theprof/teachers/Delete/Month

DELETE

Delete a month

/theprof/teachers/Delete/Lecture

DELETE

Delete a lecture

/theprof/teachers/Delete/Slider

DELETE

Delete a slider

/theprof/teachers/Delete/Notification

DELETE

Delete a notification

/theprof/teachers/see/requested/from/student

GET

View pending student requests

/theprof/teachers/accept/requested/from/student

POST

Accept a student request

 Technologies Used

Node.js + Express

MongoDB + Mongoose

bcryptjs

dayjs + moment

express-session

crypto

 Author

Developed by Ahmed Mukhtar

LinkedIn Profile www.linkedin.com/in/ahmd-mukhtar

 License

This project is licensed under the MIT License.