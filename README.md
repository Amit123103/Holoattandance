# Biometric Attendance System
use admin panel to login use:
Username: admin
password: admin123

Advanced web application for student attendance using iris and fingerprint biometric authentication.

## 🚀 Features

- **Dual Biometric Authentication**: Iris + Fingerprint verification
- **Student Registration**: Capture and store biometric data securely
- **Attendance Marking**: Real-time biometric verification
- **Admin Dashboard**: Manage students and view attendance records
- **Secure Storage**: AES-256 encryption for biometric templates
- **Export Functionality**: Download attendance reports as Excel files

## 📋 Tech Stack

### Frontend
- React.js + Vite
- Tailwind CSS (Glassmorphism design)
- React Router
- React Webcam
- Axios
- MediaPipe (Face Mesh)

### Backend
- Python FastAPI
- OpenCV + MediaPipe (Iris detection)
- SQLAlchemy (Database ORM)
- JWT Authentication
- Cryptography (AES encryption)
- Pandas + OpenPyXL (Excel export)

### Database
- SQLite (Development)
- PostgreSQL (Production-ready)

## 🛠️ Installation

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- Webcam
- Redis (v7+)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

### Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

*Note: Ensure a Redis server is running on `localhost:6379`.*

The backend will run on `http://localhost:8000`

## 🔐 Configuration

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=sqlite:///./biometric_attendance.db
JWT_SECRET_KEY=your-secret-key-here
ENCRYPTION_KEY=your-encryption-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

## 📱 Usage

### Student Registration
1. Navigate to "Student Registration"
2. Enter name and registration number
3. Capture eye scan (position face in frame)
4. Capture thumb scan (place thumb close to camera)
5. Submit registration

### Mark Attendance
1. Navigate to "Mark Attendance"
2. Complete eye scan
3. Complete thumb scan
4. System verifies and marks attendance

### Admin Panel
1. Login with admin credentials (default: admin/admin123)
2. View student records and biometric images
3. View attendance logs
4. Export attendance to Excel

## 🔒 Security Features

- **Biometric Template Encryption**: AES-256 encryption
- **JWT Authentication**: Secure admin access
- **Password Hashing**: Bcrypt for admin passwords
- **HTTPS Ready**: Production deployment support

## 🚀 Deployment

### Option 1: Docker (Recommended)
Build and run the unified container (Frontend + Backend):
```bash
docker-compose up --build
```
Access the app at `http://localhost:8000`.

### Option 2: Render.com
1. Create a **Web Service** on Render.
2. Connect your GitHub repository.
3. Select **Docker** as the Runtime.
4. Add Environment Variables:
   - `DATABASE_URL`: (Internal Connection String from a Render PostgreSQL instance)
   - `SECRET_KEY`: (Generate a secure random string)
5. Deploy! Render will build the Docker image and start the server.

### Option 3: Manual
1. **Frontend**: `cd frontend && npm run build`
2. **Backend**: `pip install -r backend/requirements.txt`
3. **Run**: `cd backend && python main.py`

## ⚠️ Important Notes

**Webcam-Based Fingerprint Limitations**:
- Lower accuracy compared to dedicated fingerprint scanners
- Requires good lighting and close positioning
- Consider USB fingerprint scanner for production use

**Privacy Compliance**:
- Ensure compliance with local biometric data regulations
- Implement proper consent mechanisms
- Follow data retention policies

## 📊 API Endpoints

### Public Endpoints
- `POST /api/register` - Register new student
- `POST /api/verify` - Verify and mark attendance

### Admin Endpoints (Requires JWT)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/students` - Get all students
- `GET /api/admin/attendance` - Get attendance records
- `GET /api/admin/attendance/export` - Export to Excel

## 🧪 Testing

Run the frontend:
```bash
cd frontend
npm run dev
```

Run the backend:
```bash
cd backend
python main.py
```

Visit `http://localhost:5173` to test the application.

## 📝 License

This project is for educational purposes.

## 🤝 Contributing

Contributions welcome! Please follow best practices for biometric data handling.

## 📧 Support

For issues or questions, please create an issue in the repository.
