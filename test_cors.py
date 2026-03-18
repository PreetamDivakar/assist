import requests

url = "https://assist-api-1n6p.onrender.com/events/dashboard"
headers = {
    "Origin": "https://my-vercel-app.vercel.app",
    "Access-Control-Request-Method": "GET"
}

try:
    response = requests.options(url, headers=headers)
    print(f"Status Code: {response.status_code}")
    print("Headers:")
    for k, v in response.headers.items():
        if "access-control" in k.lower():
            print(f"  {k}: {v}")
    
    # Try a GET request to see if CORS headers are returned
    response_get = requests.get(url, headers={"Origin": "https://my-vercel-app.vercel.app"})
    print("\nGET request CORS headers:")
    for k, v in response_get.headers.items():
         if "access-control" in k.lower():
            print(f"  {k}: {v}")
except Exception as e:
    print(f"Error: {e}")
