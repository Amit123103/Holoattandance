import sys
import os
import pytest

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("Running tests with sys.path:", sys.path)
    # Run only simple test to ensure baseline passes
    sys.exit(pytest.main(["tests/test_simple.py", "-v"]))
