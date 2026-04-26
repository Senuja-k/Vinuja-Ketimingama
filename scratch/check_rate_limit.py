import requests

url = "http://localhost:8000/api/admin/login"
for i in range(1, 8):
    response = requests.post(url, data={'username': 'test', 'password': 'test'})
    print(f"Attempt {i}: Status Code {response.status_code}")
    if response.status_code == 429:
        print("Rate limiting is working!")
        break
