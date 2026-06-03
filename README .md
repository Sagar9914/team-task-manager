# 📋 Team Task Manager

A full-stack web application for managing projects, assigning tasks, and tracking team progress — with role-based access control for Admins and Members.

---

## 🚀 Live Demo

> Deploy your own using the [Railway guide](#-deployment) below.

---

## ✨ Features

- **Authentication** — Signup & Login with JWT tokens
- **Role-Based Access** — Admin can create/manage everything; Members can only view and update their assigned tasks
- **Project Management** — Create projects and add team members
- **Task Management** — Create tasks, assign to members, set due dates and status
- **Dashboard** — Real-time counts for Total, Todo, In Progress, Done, and Overdue tasks
- **Protected Routes** — Frontend and backend both enforce role permissions

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Deployment | Railway (backend + DB) + Vercel (frontend) |

---

## 📁 Project Structure

```
team-task-manager/
├── server/                     # Express backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # PostgreSQL connection pool
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── projectController.js
│   │   │   ├── taskController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT verification + role check
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── projectRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   └── userRoutes.js
│   │   └── index.js            # Express app entry point
│   ├── .env                    # Environment variables (not committed)
│   └── package.json
│
└── client/                     # React frontend
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx  # Global auth state
    │   ├── components/
    │   │   └── Layout.jsx       # Sidebar + navigation
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Projects.jsx
    │   │   └── Tasks.jsx
    │   ├── utils/
    │   │   └── api.js           # Axios instance with auth interceptor
    │   ├── App.jsx              # Routes + protected route wrappers
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ⚙️ Local Setup

### Prerequisites

- Node.js v18+
- PostgreSQL installed and running
- Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/team-task-manager.git
cd team-task-manager
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/team_task_manager
JWT_SECRET=your_long_random_secret_here
```

> Generate a strong JWT secret:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 3. Set up the PostgreSQL database

Open `psql` or pgAdmin and run:

```sql
CREATE DATABASE team_task_manager;
\c team_task_manager;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  global_role VARCHAR(20) NOT NULL CHECK (global_role IN ('ADMIN', 'MEMBER')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE project_members (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'MEMBER')),
  UNIQUE (project_id, user_id)
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE')),
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Start the backend

```bash
npm run dev
```

Server runs at: `http://localhost:5000`

### 5. Set up the frontend

```bash
cd ../client
npm install
npm run dev
```

App runs at: `http://localhost:5173`

> The Vite dev server proxies all `/api` requests to `http://localhost:5000` automatically.

---

## 🔌 API Reference

### Auth

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and get JWT token |

### Projects

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/projects` | Auth | List all projects (admin) or joined projects (member) |
| POST | `/api/projects` | Admin | Create a new project |
| POST | `/api/projects/:id/members` | Admin | Add a user to a project |

### Tasks

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/tasks` | Auth | All tasks (admin) or assigned tasks (member) |
| POST | `/api/tasks` | Admin | Create and assign a task |
| PATCH | `/api/tasks/:id/status` | Auth | Update task status |
| GET | `/api/tasks/dashboard/summary` | Auth | Get task counts and overdue summary |

### Users

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Auth | List all users (for assignment dropdowns) |

---

## 🔐 Role-Based Access Control

| Feature | Admin | Member |
|---------|-------|--------|
| Create project | ✅ | ❌ |
| Add member to project | ✅ | ❌ |
| Create task | ✅ | ❌ |
| View all tasks | ✅ | ❌ |
| View own tasks | ✅ | ✅ |
| Update task status | ✅ | ✅ (own tasks only) |
| Dashboard summary | ✅ (all tasks) | ✅ (own tasks) |

---

## 🚂 Deployment

### Backend on Railway

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub Repo**
3. Set **Root Directory** to `server`
4. Set **Start Command** to `npm start`
5. Add environment variables:
   ```
   PORT=5000
   JWT_SECRET=your_secret_here
   NODE_ENV=production
   ```

### Add PostgreSQL on Railway

1. In your Railway project → **New Service** → **Database** → **PostgreSQL**
2. Add to your backend service variables:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```
3. Run the SQL schema via Railway's Query tab

### Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
2. Set **Root Directory** to `client`
3. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```
4. Deploy!

---

## 🧪 Testing the API (Postman)

1. **Signup** — `POST /api/auth/signup` with `{ name, email, password, global_role }`
2. **Login** — `POST /api/auth/login` → copy the `token` from the response
3. **Use token** — In Postman, go to **Authorization** → **Bearer Token** → paste the token
4. **Create project** — `POST /api/projects`
5. **Add member** — `POST /api/projects/1/members`
6. **Create task** — `POST /api/tasks`
7. **Update status** — `PATCH /api/tasks/1/status`
8. **Dashboard** — `GET /api/tasks/dashboard/summary`

---

## 🐛 Common Issues

**`password authentication failed for user`**
→ Fix `DATABASE_URL` in `.env` with your correct PostgreSQL username and password.

**`relation "users" does not exist`**
→ You haven't run the SQL schema yet. Run it in psql or pgAdmin.

**`Cannot POST /api/auth/projects`**
→ Wrong URL. Use `/api/projects`, not `/api/auth/projects`.

**`insert or update violates foreign key constraint`**
→ The user ID you're referencing doesn't exist. Create the user first via signup.

**Frontend shows blank / API errors**
→ Make sure the backend is running on port 5000 and `vite.config.js` has the proxy set up.

---

## 📄 License

MIT — free to use for learning and interview assignments.

---

## 👤 Author

Built as a job-selection assignment for a Full-Stack Developer role.
