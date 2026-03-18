import base64
from cryptography.hazmat.primitives.asymmetric import ec

private_key = ec.generate_private_key(ec.SECP256R1())

pub_numbers = private_key.public_key().public_numbers()
x_bytes = pub_numbers.x.to_bytes(32, byteorder='big')
y_bytes = pub_numbers.y.to_bytes(32, byteorder='big')
uncompressed_pub = b'\x04' + x_bytes + y_bytes
public_b64 = base64.urlsafe_b64encode(uncompressed_pub).decode('ascii').rstrip('=')

priv_numbers = private_key.private_numbers()
d_bytes = priv_numbers.private_value.to_bytes(32, byteorder='big')
private_b64 = base64.urlsafe_b64encode(d_bytes).decode('ascii').rstrip('=')

with open('keys_real.txt', 'w') as f:
    f.write(public_b64 + '\n')
    f.write(private_b64 + '\n')
