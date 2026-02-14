from app.biometric_extractor import BiometricExtractor
import cv2
import numpy as np
import base64

class LivenessService:
    def __init__(self):
        self.extractor = BiometricExtractor()

    def verify_liveness(self, image_data: str, challenge: str):
        """
        Verifies if the biometric data matches the requested challenge.
        Challenges: 'LOOK_LEFT', 'LOOK_RIGHT', 'SMILE', 'CENTER'
        """
        try:
            # Decode image
            if "," in image_data:
                image_data = image_data.split(",")[1]
            img_bytes = base64.b64decode(image_data)
            nparr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                return {"verified": False, "message": "Invalid image"}

            h, w, c = img.shape
            
            # Get landmarks using the existing extractor method (we might need to expose the mesh directly)
            # Since biometric_extractor.py logic is encapsulated, let's look at what we can reuse.
            # We updated biometric_extractor.py to have methods, but we need the raw face landmarks first.
            # We'll need to instantiate the FaceMesh separately or add a helper to Extractor.
            
            # For efficiency, let's assume we can get landmarks from extractor if we expose it or just re-run mp logic here.
            # Since Extractor mainly does "get_eye_features", let's use a fresh MP instance here for liveness to keep it clean.
            
            import mediapipe as mp
            mp_face_mesh = mp.solutions.face_mesh
            
            with mp_face_mesh.FaceMesh(
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            ) as face_mesh:
                
                rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                results = face_mesh.process(rgb_img)
                
                if not results.multi_face_landmarks:
                    return {"verified": False, "message": "No face detected"}
                
                landmarks = results.multi_face_landmarks[0].landmark
                
                # Get Head Pose
                img_h, img_w, _ = img.shape
                pitch, yaw, roll = self.extractor.get_head_pose(landmarks, img_w, img_h)
                
                # Check Challenge
                verified = False
                message = "Action not detected"
                
                if challenge == 'LOOK_LEFT':
                    # Yaw should be positive (or negative depending on coord system, let's calibrate)
                    # Typically looking left (viewer's left) means head turns right (yaw changes)
                    # Let's assume threshold.
                    if yaw < -10: # Thresholds need tuning
                        verified = True
                        message = "Look Left verified"
                    else:
                        message = f"Turn head more left (Yaw: {yaw:.1f})"
                        
                elif challenge == 'LOOK_RIGHT':
                    if yaw > 10:
                        verified = True
                        message = "Look Right verified"
                    else:
                        message = f"Turn head more right (Yaw: {yaw:.1f})"
                        
                elif challenge == 'SMILE':
                    # Simple Mouth Aspect Ratio or corner distance
                    # Smile: corners (61, 291) move up/out.
                    # Simple check: distance between lip corners vs distance between eyes (normalization)
                    
                    # Or simpler: get_head_pose is overkill for smile. 
                    # Let's trust the pose challenge for now.
                    # Implement Smile:
                    # MAR = |top_lip - bottom_lip| / |left_corner - right_corner| (Open mouth?) 
                    # Smile is usually widening of mouth.
                    
                    # Let's stick to Head Rotation for robustness first.
                    verified = False
                    message = "Smile detection not fully calibrated, use Turn"

                elif challenge == 'CENTER':
                    if abs(yaw) < 10 and abs(pitch) < 10:
                        verified = True
                        message = "Centered"
                    else:
                         message = "Look straight at camera"

                return {
                    "verified": verified, 
                    "message": message, 
                    "details": {"yaw": float(yaw), "pitch": float(pitch)}
                }

        except Exception as e:
            print(f"Liveness Error: {e}")
            return {"verified": False, "message": "Server error processing liveness"}
