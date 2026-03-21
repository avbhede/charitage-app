import requests

url = "http://localhost:8000/api/auth/login"
data = {"email": "admin@charitage.com", "password": "adminpass"}
res = requests.post(url, json=data)
print("Status:", res.status_code)
print("Body:", res.text)
