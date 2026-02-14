# Quick Start Guide

## Running the Application

### 1. Start Backend Server

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Backend will run on: **http://localhost:8000**

### 2. Start Frontend Server

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on: **http://localhost:5173**

### 3. Access the Application

Open your browser and navigate to: **http://localhost:5173**

## Default Admin Credentials

- **Username:** admin
- **Password:** admin123

## Testing Flow

1. **Register a Student**
   - Click "Student Registration"
   - Fill in name and registration number
   - Complete eye scan
   - Complete thumb scan

2. **Mark Attendance**
   - Click "Mark Attendance"
   - Complete biometric verification
   - View result

3. **Admin Panel**
   - Login with admin credentials
   - View students and attendance records
   - Export data to Excel

## Troubleshooting

If backend fails to start, manually install dependencies:
```bash
cd backend
.\venv\Scripts\python.exe -m pip install fastapi uvicorn python-jose[cryptography] passlib bcrypt sqlalchemy python-dotenv opencv-python mediapipe numpy pillow pandas openpyxl cryptography python-multipart
```

Then run:
```bash
.\venv\Scripts\python.exe main.py
```
