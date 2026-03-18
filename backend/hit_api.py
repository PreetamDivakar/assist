import urllib.request
import json

req = urllib.request.Request(
    "http://localhost:8000/chat/",
    data=b'{"message":"anna birthday", "history":[]}',
    headers={"Content-Type": "application/json"}
)

with open("api_out.txt", "w") as f:
    try:
        resp = urllib.request.urlopen(req)
        f.write("SUCCESS\n" + resp.read().decode())
    except Exception as e:
        f.write("Error: " + str(e) + "\n")
        if hasattr(e, "read"):
            f.write(e.read().decode())
