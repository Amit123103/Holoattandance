import sys
import os
# Adjust path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import Base
from app import models

def test_models_exist():
    assert models.Student is not None
