import os
import hashlib

# Check pdf_content/assets
assets_dir = "pdf_content/assets"
for f in os.listdir(assets_dir):
    p = os.path.join(assets_dir, f)
    if os.path.isfile(p):
        with open(p, "rb") as fl:
            data = fl.read()
            md5 = hashlib.md5(data).hexdigest()
            print(f"{f}: {len(data)} bytes, md5={md5}")
