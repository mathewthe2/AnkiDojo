import requests
import math
import random
import re

# https://github.com/typeling1578/Search-on-Google-Lens/blob/af04f2c01dd6f93b163b561807cb4597813c3ab4/background.js
def generateRandomString(n):
    s = "abcdefghijklmnopqrstuvwxyz0123456789"
    str = ""
    for i in range(n):
        str += s[math.floor(random.random() * len(s))]
    return str

def get_google_lens_url(imageFile):
    body = {
        "image_url": "https://" + generateRandomString(12) + ".com/" + generateRandomString(12),
        "sbisrc": "Chromium 98.0.4725.0 Windows"
    }
    files = {'encoded_image': imageFile}
    result = requests.post('https://lens.google.com/upload?ep=ccm&s=&st=' + generateRandomString(12),data=body, files=files)
    if result.status_code == 200:
        print(result.text)
        matches = re.findall(r"https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+", result.text)
        if matches:
            url = matches[0]
            return url
