# BuildControl KR — Construction Project Management MVP

BuildControl KR is a platform designed to streamline construction workflows through task tracking, photo reporting, and basic material accounting.

## Features
- **Role-Based Access:** Administrator, Foreman, and Worker roles.
- **Project Management:** Create and track construction sites.
- **Task Tracking:** Assign tasks, track status (Planned, In Progress, Completed).
- **Photo Reporting:** Upload photos as proof of task completion.
- **Material Inventory:** Manage on-site materials and track usage.
- **Dashboard:** Real-time visualization of project progress.

## Tech Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Vanilla CSS, React Query.
- **Backend:** FastAPI, Python, SQLModel (SQLAlchemy + Pydantic).
- **Database:** SQLite (default for MVP) or PostgreSQL.

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - Windows: `.\venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Run the server:
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   *The system will automatically create an initial admin user: `admin@example.com` / `admin123`*

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Success Criteria Checklist
- [x] Create a construction project
- [x] Add tasks to the project
- [x] Upload photos as proof of work
- [x] Track materials usage
- [x] View project progress in the dashboard
