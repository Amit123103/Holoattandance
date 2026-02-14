import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_database_import():
    from app import database
    assert database.Base is not None
    print("Database imported successfully")
