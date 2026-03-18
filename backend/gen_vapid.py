from vapid import Vapid
v = Vapid()
v.generate_keys()
import base64
with open("keys_vapid.txt", "w") as f:
    # v.public_key is a string or bytes, depends on version.
    # We can just get them from internal properties or methods
    pub = base64.urlsafe_b64encode(v.public_key).decode('utf-8').replace('=', '')
    priv = base64.urlsafe_b64encode(v.private_key).decode('utf-8').replace('=', '')
    f.write(f"{pub}\n{priv}\n")
