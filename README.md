<div align="center">

<img src="docs/images/logo.png" alt="NexOps Logo" width="140"/>

# NexOps Enterprise Platform

### Enterprise HR & Operations Management System

A modern, production-style Enterprise HR & Operations Management System built with the MERN Stack.


### Live View : https://nexops-enterprise-platform.vercel.app/login

<p>

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-Backend-000000?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-38BDF8?style=for-the-badge&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite)

</p>

</div>

---

# Banner

<p align="center">
<img src="docs/images/banner.png" width="100%">
</p>

---

# Overview

NexOps Enterprise Platform is a production-ready Enterprise HR & Operations Management System developed using the MERN Stack.

The application simulates how organizations manage employees, departments, attendance, leave requests, assets, projects, and helpdesk operations through a secure web-based dashboard.

The project focuses on clean architecture, modular design, scalability, and maintainability, making it an excellent foundation for Cloud, DevOps, Linux Administration, and Infrastructure deployment projects.

---

# Features

- JWT Authentication
- Role-Based Access Control (Admin, HR, Employee)
- Employee Management
- Department Management
- Attendance Tracking
- Leave Management
- Asset Management
- Project Management
- Helpdesk Ticket System
- Dashboard Analytics
- Notifications
- User Profile
- Search & Filtering
- Audit Logs
- Responsive Design
- Modern Enterprise UI

---

# Technology Stack

## Frontend

- React
- Vite
- Tailwind CSS
- React Router DOM
- Axios

---

## Backend

- Node.js
- Express.js
- JWT Authentication
- Bcrypt
- Multer
- Nodemailer

---

## Database

- MongoDB
- Mongoose

---

# System Architecture

<p align="center">
<img src="docs/images/architecture.png" width="100%">
</p>

---

# Folder Structure

```text
nexops-enterprise-platform
│
├── frontend
│
├── backend
│
├── docs
│   ├── images
│   │   ├── banner.png
│   │   ├── logo.png
│   │   ├── architecture.png
│   │   ├── dashboard.png
│   │   ├── login.png
│   │   ├── employees.png
│   │   ├── departments.png
│   │   ├── attendance.png
│   │   ├── leave.png
│   │   ├── assets.png
│   │   ├── projects.png
│   │   ├── helpdesk.png
│   │   ├── profile.png
│   │   └── responsive.png
│   │
│   ├── architecture.md
│   ├── api.md
│   ├── deployment.md
│   └── database.md
│
├── .gitignore
├── LICENSE
└── README.md
```

---

# Screenshots

## Login

![](docs/images/login.png)

---

## Dashboard

![](docs/images/dashboard.png)

---

## Employees

![](docs/images/employees.png)

---

## Departments

![](docs/images/departments.png)

---

## Attendance

![](docs/images/attendance.png)

---

## Leave Management

![](docs/images/leave.png)

---

## Asset Management

![](docs/images/assets.png)

---

## Projects

![](docs/images/projects.png)

---

## Helpdesk

![](docs/images/helpdesk.png)

---

## User Profile

![](docs/images/profile.png)

---

## Responsive Design

![](docs/images/responsive.png)

---

# Installation

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/nexops-enterprise-platform.git
```

Move into project

```bash
cd nexops-enterprise-platform
```

---

# Frontend Setup

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Create

```
.env
```

Add

```env
VITE_API_URL=http://localhost:5000/api
```

Run

```bash
npm run dev
```

Frontend

```
http://localhost:5173
```

---

# Backend Setup

Open another terminal

```bash
cd backend
```

Install dependencies

```bash
npm install
```

Create

```
.env
```

Add

```env
PORT=5000

MONGO_URI=YOUR_MONGODB_CONNECTION_STRING

JWT_SECRET=YOUR_SECRET_KEY

JWT_EXPIRE=7d
```

Run

```bash
npm run dev
```

Backend

```
http://localhost:5000
```

---

# MongoDB Setup

1. Create a free MongoDB Atlas account.

2. Create a Cluster.

3. Create a Database User.

4. Whitelist your IP.

5. Copy the connection string.

6. Paste it into

```env
MONGO_URI=
```

---

# API Endpoints

## Authentication

| Method | Endpoint |
|----------|----------------|
| POST | /api/auth/login |
| POST | /api/auth/register |

---

## Employees

| Method | Endpoint |
|----------|----------------|
| GET | /api/employees |
| POST | /api/employees |
| PUT | /api/employees/:id |
| DELETE | /api/employees/:id |

---

## Departments

| Method | Endpoint |
|----------|----------------|
| GET | /api/departments |
| POST | /api/departments |

---

## Attendance

| Method | Endpoint |
|----------|----------------|
| GET | /api/attendance |

---

## Leave

| Method | Endpoint |
|----------|----------------|
| GET | /api/leaves |

---

## Assets

| Method | Endpoint |
|----------|----------------|
| GET | /api/assets |

---

## Projects

| Method | Endpoint |
|----------|----------------|
| GET | /api/projects |

---

## Helpdesk

| Method | Endpoint |
|----------|----------------|
| GET | /api/tickets |

---

# Authentication

The application uses

- JWT Authentication
- Password Hashing (bcrypt)
- Role-Based Access Control
- Protected API Routes

---

# Build for Production

Frontend

```bash
npm run build
```

Backend

```bash
npm start
```

---

# Deployment

| Service | Platform |
|----------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

---

# Future Improvements

- Docker
- Docker Compose
- Redis Cache
- Email Verification
- Two-Factor Authentication
- Audit Dashboard
- Export Reports (PDF/Excel)
- Advanced Analytics
- Multi-language Support
- AWS Deployment
- Kubernetes
- CI/CD Pipeline
- Monitoring & Logging

---

# Contributing

Contributions are welcome.

1. Fork the repository

2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit changes

```bash
git commit -m "Add new feature"
```

4. Push

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

# License

This project is licensed under the MIT License.

---

# Connect with Me

**Nitesh Vishwakarma**

GitHub

https://github.com/NiteshVishwakarma219

LinkedIn

https://linkedin.com/in/nitesh1vishwakarma

---

<div align="center">

### ⭐ If you found this project useful, please consider giving it a Star.

Made with ❤️ by Nitesh Vishwakarma

</div>


# Purpose of this Project

This application serves as the foundation for three enterprise infrastructure projects:

- ☁️ Enterprise AWS Infrastructure with Terraform
- 🚀 Enterprise DevOps & Kubernetes Platform
- 🐧 Enterprise Linux Operations & SRE Platform

The same application is deployed across different environments to demonstrate cloud infrastructure, automation, CI/CD, containerization, monitoring, logging, and Linux administration skills.