# BuildControl KR — Product Requirements Document

## 1. Overview

BuildControl KR is a web-based platform designed to help manage construction projects through task tracking, photo reporting, and basic material accounting.

Construction project management often suffers from poor communication, lack of visibility into task progress, and difficulty tracking materials and completed work. BuildControl KR aims to address these issues by providing a centralized system where administrators, foremen, and workers can collaborate on construction tasks.

The goal of the MVP (Minimum Viable Product) is to demonstrate the core concept of the platform during a hackathon and allow basic testing on a real construction project. The MVP will focus on the most essential workflows: creating projects, assigning tasks, uploading photo reports, managing materials, and visualizing project progress.

The system will be accessible through a web interface and support three user roles: Administrator, Foreman, and Worker.

---

## 2. Core Features (MVP)

### 1. Authentication

Users must log in using:
- Email
- Password

User accounts are created by the Administrator.

### 2. Role-Based Access Control

The system supports three roles:

**Administrator**
- Create and manage construction projects
- View all tasks
- View reports
- Manage materials
- Create users and assign roles

**Foreman**
- Create and manage tasks
- Assign tasks to workers
- Upload photo reports
- Record material usage

**Worker**
- View assigned tasks
- Upload task completion photos
- Mark tasks as completed

### 3. Project Management

Administrators can create construction projects.

Project fields include:
- Project name
- Construction site address
- Start date
- End date
- Description

Projects are displayed in a project list with progress indicators.

### 4. Task Management

Tasks exist inside projects.

Task fields:
- Task title
- Description
- Deadline
- Assigned worker
- Status

Task statuses:
- Planned
- In Progress
- Completed

Foremen can:
- Create tasks
- Edit tasks
- Mark tasks as completed

### 5. Photo Reporting

Each task supports photo uploads to document work progress.

Features:
- Upload photo
- Add comment
- Store upload date

Photos are attached to the corresponding task. This feature demonstrates construction progress verification.

### 6. Materials Management (Basic)

Each project contains a Materials section.

Users can add materials with:
- Material name
- Quantity
- Unit of measurement

Foremen can:
- Deduct materials when they are used for a task

The system displays the current remaining quantity.

### 7. Dashboard

After login, users see a dashboard showing:
- List of projects
- Project completion percentage
- Total number of tasks
- Number of completed tasks

Project progress is calculated as: **Completed Tasks / Total Tasks**

### 8. Admin Panel

The administrator has access to a basic admin panel where they can:
- Create users
- Assign roles
- Delete projects
- View basic statistics

### 9. Landing Page

A public landing page explains the product.

Sections include:
- Product description
- Construction industry problems
- BuildControl solution
- Key benefits
- "Login to System" button

---

## 3. Non-Goals

The following features are out of scope for the MVP:
- Mobile application
- Real-time chat or messaging
- Advanced analytics
- Financial accounting
- Integration with external construction software
- GPS tracking
- Offline mode
- Push notifications
- Advanced material inventory management
- Multi-language support
- Document management
- AI-based construction analysis

These features may be considered in future product iterations.

---

## 4. Technical Constraints

The MVP must follow these technical constraints:

**Frontend**
- React or Next.js
- Simple responsive UI optimized for laptop usage

**Backend**
- FastAPI

**Database**
- PostgreSQL

**Hosting**
- Vercel, AWS, or DigitalOcean

**Other Constraints**
- The system should be simple and quick to deploy
- Authentication should be secure but minimal for MVP
- File uploads must support image storage
- The architecture should allow future scalability

---

## 5. Success Criteria

The MVP will be considered successful if the following conditions are met:

**Functional Success**

During a live demo it must be possible to:
- Create a construction project
- Add tasks to the project
- Assign tasks to workers
- Upload photos as proof of work
- Track materials usage
- View project progress in the dashboard

**Demonstration Success**

The product must allow a presenter to say:
> "Here is a real construction project. Here are the tasks. Here are photos of completed work. And here are the remaining materials."

**Technical Success**
- The system runs reliably during demo
- Users can log in and access role-specific functionality
- Photo uploads work correctly
- Task progress updates correctly
