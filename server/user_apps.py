import os
import json
import requests

# Paths
user_apps_directory = os.path.join(os.path.dirname(__file__), 'data', 'user_apps')
COMMUNITY_CATALOG_URL = 'https://raw.githubusercontent.com/mathewthe2/AnkiDojo-Apps/main/catalog.json'

class UserApps():
    def __init__(self):
        pass

    def get_apps(self):
        apps = []
        app_paths = [f.path for f in os.scandir(user_apps_directory) if f.is_dir()]
        for app_path in app_paths:
            meta_path = os.path.join(app_path, 'meta.json')
            if os.path.isfile(meta_path):
                with open(meta_path, encoding="utf8") as f:
                    app_meta = json.load(f)
                    app_meta["id"] = os.path.basename(app_path)
                    apps.append(app_meta)
        return apps

    def get_community_apps(self):
        r = requests.get(COMMUNITY_CATALOG_URL)
        if r.status_code == 200:
            return r.json()
        else:
            return []