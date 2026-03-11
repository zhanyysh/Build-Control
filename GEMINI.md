# GEMINI.md - BuildControl KR Project Context

## Project Overview
**BuildControl KR** is a web-based platform designed to streamline construction project management through task tracking, photo reporting, and basic material accounting. The project is currently in the planning/architecture phase, as defined by the Minimum Viable Product (MVP) requirements.

The system aims to serve three primary roles:
- **Administrator:** Full control over projects, users, materials, and statistics.
- **Foreman:** Task management, assignment, photo reporting, and material usage tracking.
- **Worker:** Task viewing and completion with photo evidence.

## Directory Structure Overview
- `PRD.md`: The Product Requirements Document. It outlines the core features, user roles, technical constraints, and success criteria for the MVP.
- `GEMINI.md`: This file, providing context and instructions for AI interactions within this workspace.

## Key Technical Specifications (Planned)
Based on the `PRD.md`, the following stack is planned for implementation:
- **Frontend:** React or Next.js (Responsive UI).
- **Backend:** FastAPI.
- **Database:** PostgreSQL.
- **Hosting:** Vercel, AWS, or DigitalOcean.

## Core Workflows
1. **Project & User Setup:** Administrators create projects and user accounts.
2. **Task Assignment:** Foremen create tasks within projects and assign them to workers.
3. **Execution & Reporting:** Workers perform tasks and upload photo reports as proof of completion.
4. **Resource Tracking:** Foremen record material consumption against project inventory.
5. **Monitoring:** All roles view progress via a centralized dashboard.

## Usage Instructions
This directory serves as the source of truth for the project's requirements and architecture. When working within this workspace:
- Refer to `PRD.md` for feature scope and role permissions.
- Ensure any proposed code or architectural changes align with the "MVP Core Features" and "Technical Constraints" sections.
- Non-goals listed in `PRD.md` should be avoided to maintain focus on the hackathon-ready prototype.
