from cryptography.fernet import Fernet
import base64
import os
from dotenv import load_dotenv
import hashlib

load_dotenv()

class BiometricEncryption:
    """Handle encryption and decryption of biometric templates"""
    
    def __init__(self):
        # Get encryption key from environment or generate one
        key_string = os.getenv("ENCRYPTION_KEY", "dev-encryption-key-32-bytes-long")
        
        # Create a proper 32-byte key using SHA256
        key_hash = hashlib.sha256(key_string.encode()).digest()
        key = base64.urlsafe_b64encode(key_hash)
        self.cipher = Fernet(key)
    
    def encrypt_template(self, template_data: bytes) -> bytes:
        """Encrypt biometric template"""
        return self.cipher.encrypt(template_data)
    
    def decrypt_template(self, encrypted_data: bytes) -> bytes:
        """Decrypt biometric template"""
        return self.cipher.decrypt(encrypted_data)
