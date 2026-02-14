from locust import HttpUser, task, between
import random
import json

class HoloUser(HttpUser):
    wait_time = between(1, 5)
    token = None

    def on_start(self):
        """Login as admin on start"""
        response = self.client.post("/api/admin/login", json={
            "username": "admin",
            "password": "admin123"
        })
        if response.status_code == 200:
            self.token = response.json().get("access_token")

    @task(2)
    def view_dashboard(self):
        """Simulate viewing the dashboard (students and attendance)"""
        if not self.token: return
        
        headers = {"Authorization": f"Bearer {self.token}"}
        self.client.get("/api/admin/students", headers=headers)
        self.client.get("/api/admin/attendance", headers=headers)

    @task(1)
    def view_analytics(self):
        """Simulate viewing analytics"""
        if not self.token: return
        
        headers = {"Authorization": f"Bearer {self.token}"}
        self.client.get("/api/admin/analytics/overview", headers=headers)
        self.client.get("/api/admin/analytics/daily-stats", headers=headers)

    @task(1)
    def verify_student_simulation(self):
        """Simulate a biometric verification attempt"""
        # We'll send dummy base64 data to test the endpoint structure/latency
        # The backend might reject it if image is invalid, but it stresses the server
        dummy_image = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q=="
        
        self.client.post("/api/verify", json={
            "eye_image": dummy_image,
            "thumb_image": dummy_image
        })
