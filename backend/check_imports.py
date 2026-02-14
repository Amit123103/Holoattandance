import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

print("Path:", sys.path)

try:
    import app
    print("SUCCESS: import app")
    print("App file:", app.__file__)
except ImportError as e:
    print("FAIL: import app", e)

try:
    from app import auth
    print("SUCCESS: from app import auth")
except ImportError as e:
    print("FAIL: from app import auth", e)

try:
    from app.config_service import config_service
    print("SUCCESS: from app.config_service import config_service")
except ImportError as e:
    print("FAIL: from app.config_service", e)

try:
    import main
    print("SUCCESS: import main")
except ImportError as e:
    print("FAIL: import main", e)
