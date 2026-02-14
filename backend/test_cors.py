
import requests
import sys

def test_cors():
    url = "http://localhost:8000/api/register"
    headers = {
        "Origin": "http://localhost:5188",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type"
    }
    
    try:
        print(f"Testing OPTIONS request to {url} with Origin: {headers['Origin']}")
        response = requests.options(url, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {response.headers}")
        
        if response.status_code == 200:
            print("SUCCESS: CORS OPTIONS request verification passed!")
            sys.exit(0)
        else:
            print(f"FAILURE: CORS OPTIONS request failed with status {response.status_code}")
            print(response.text)
            sys.exit(1)
            
    except Exception as e:
        print(f"ERROR: Could not connect to backend: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_cors()
