# 📘 Holo Attendance System - User Manual

Welcome to **Holo**, the futuristic biometric attendance system. This guide will help you navigate the application as a Student or Administrator.

---

## 👨‍🎓 For Students

### 1. Registration
*   **Step 1**: Navigate to the **Register** page from the Home screen.
*   **Step 2**: Enter your **Full Name** and **Registration Number** (e.g., `REG123`).
*   **Step 3**: Click **"Start Registration"**.
*   **Step 4**: **Eye Scan**: Position your face within the frame. The system will automatically capture your iris data when alignment is perfect.
*   **Step 5**: **Thumb Scan**: Show your thumb to the camera. Hold it steady until the green circle completes.
*   **Step 6**: Success! You are now registered.

### 2. Marking Attendance
*   **Step 1**: Go to the **Attendance** page.
*   **Step 2**: **Eye Verification**: Look at the camera.
*   **Step 3**: **Thumb Verification**: Show your thumb.
*   **Step 4**: **Liveness Check**: If prompted, follow the voice instructions (e.g., "Blink your eyes", "Turn head left").
*   **Step 5**: Upon success, your name and registration number will appear, and attendance is marked.

### 3. Offline Mode
*   If the internet disconnects, you will see an **"Offline Mode"** badge.
*   You can still mark attendance! Data is saved locally and will automatically sync when you reconnect.

---

## 👨‍💼 For Administrators

### 1. Login
*   Access the **Admin Dashboard** via the "Admin Login" button (or `/admin/login`).
*   Default Credentials: `admin` / `admin123`.

### 2. Dashboard Overview
*   **Real-Time Feed**: Watch live attendance events on the right panel.
*   **Stats**: View daily, weekly, and monthly attendance counts.
*   **Charts**: Analyze trends using the interactive graphs.

### 3. Managing Users
*   **View Students**: Detailed list of all registered users with their biometric photos.
*   **Search**: Filter by Name or Reg No.
*   **CSV Upload**: Bulk register students by dragging and dropping a CSV file.

### 4. Reports & Exports
*   **Export Excel**: Click the **Download** button in the "Attendance Logs" tab to get a full `.xlsx` report.
*   **PDF Reports**: Generate individual student history by viewing their profile.

### 5. Settings
*   **Theme**: Toggle between "Cyberpunk", "Minimal", or "Corporate" themes.
*   **Language**: Switch interface language (EN/ES/FR).
*   **System Health**: Monitor server performance and token status.

### 6. Installation (PWA)
*   **Desktop**: Click the "Install" icon in your browser address bar to run Holo as a native app.
*   **Mobile**: Tap "Share" -> "Add to Home Screen" on iOS/Android.

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Camera not working** | Ensure browser permissions are allowed for Camera. |
| **"Face not detected"** | Improve lighting and remove mask/sunglasses. |
| **Sync Failed** | Check your internet connection. Pending records will retry automatically. |
| **Login Failed** | Reset password via database admin or contact IT support. |

---

*Powered by Holo Artificial Intelligence*
