# 🚀 Holo Deployment Guide

This guide covers how to deploy the Holo Attendance System to a production environment.

---

## 📦 Docker Deployment (Recommended)

The easiest way to run Holo is using Docker Compose. This starts the Frontend, Backend, and Database in isolated containers.

### Prerequisites
- Docker & Docker Compose installed.

### Steps
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-repo/holo.git
    cd holo
    ```

2.  **Environment Configuration**:
    - Create a `.env` file in `backend/` based on `.env.example`.
    - Set `SECRET_KEY`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, etc.

3.  **Build and Run**:
    ```bash
    docker-compose up --build -d
    ```

4.  **Access the Application**:
    - Frontend: `http://localhost:5173` (or configured domain)
    - Backend API: `http://localhost:8000`
    - Documentation: `http://localhost:8000/docs`

---

## ☁️ Cloud Deployment (Render/Railway)

### Backend (Python/FastAPI)
1.  **Build Command**: `pip install -r requirements.txt`
2.  **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3.  **Environment Variables**:
    - `DATABASE_URL`: Connection string to your PostgreSQL instance.
    - `SECRET_KEY`: Your JWT secret.

### Frontend (React/Vite)
1.  **Build Command**: `npm install && npm run build`
2.  **Publish Directory**: `dist`
3.  **Environment Variables**:
    - `VITE_API_URL`: The URL of your deployed Backend (e.g., `https://holo-api.onrender.com`).

---

## 🔧 Manual Setup (Linux/Ubuntu)

### Backend
```bash
sudo apt update && sudo apt install python3-venv postgresql
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
sudo apt install nodejs npm
cd frontend
npm install
npm run build
# Serve 'dist' using Nginx or Apache
```

---

## 🛡️ Security Checklist
- [ ] Change default `admin` password immediately.
- [ ] Set `DEBUG=False` in backend settings.
- [ ] Use HTTPS (SSL) for all connections.
- [ ] Configure firewall to allow only necessary ports (80, 443).
