from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from typing import List, Dict
import os
from dotenv import load_dotenv

load_dotenv()

class EmailService:
    def __init__(self):
        self.conf = ConnectionConfig(
            MAIL_USERNAME = os.getenv("MAIL_USERNAME", "user@example.com"),
            MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "password"),
            MAIL_FROM = os.getenv("MAIL_FROM", "admin@holoauth.com"),
            MAIL_PORT = int(os.getenv("MAIL_PORT", 587)),
            MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com"),
            MAIL_STARTTLS = True,
            MAIL_SSL_TLS = False,
            USE_CREDENTIALS = True,
            VALIDATE_CERTS = True
        )
        self.fm = FastMail(self.conf)

    async def send_attendance_confirmation(self, email: EmailStr, name: str, time: str, status: str):
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #000; color: #06b6d4; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">Holo Auth</h1>
            </div>
            <div style="padding: 20px;">
                <h2>Attendance Confirmation</h2>
                <p>Hello <strong>{name}</strong>,</p>
                <p>Your attendance has been successfully marked.</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Time:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">{time}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Status:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; color: green;">{status}</td>
                    </tr>
                </table>
                <p style="margin-top: 20px;">Keep up the great work!</p>
            </div>
            <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;"> 
                &copy; 2026 Holo Biometric System
            </div>
        </div>
        """

        message = MessageSchema(
            subject="Attendance Marked Successfully ✅",
            recipients=[email],
            body=html,
            subtype=MessageType.html
        )
        
        try:
            await self.fm.send_message(message)
            return True
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False
