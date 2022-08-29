import re
import requests
from .util import AnkiHelper
from .user_apps import UserApps

from flask import (
    Blueprint, current_app, jsonify, redirect, request, send_from_directory
)

# from .db import get_db

WEBPACK_DEV_SERVER_HOST = "http://localhost:8080"
session = requests.Session()
ankiHelper = AnkiHelper()
userApps = UserApps()

def proxy(host, path):
    response = session.get(f"{host}{path}")
    excluded_headers = [
        "content-encoding",
        "content-length",
        "transfer-encoding",
        "connection",
    ]
    headers = {
        name: value
        for name, value in response.raw.headers.items()
        if name.lower() not in excluded_headers
    }
    return (response.content, response.status_code, headers)

bp = Blueprint('mine', __name__)

@bp.route('/')
def index():
    return redirect("/home.html")

# @bp.route("/media/<path:path>")
# def get_media(path):
#     return send_from_directory('data/media', path)

@bp.route("/apps/<path:path>")
def get_media(path):
    return send_from_directory('data/user_apps', path)

@bp.route("/", defaults={"path": "index.html"})
@bp.route("/<path:path>")
def get_app(path):
    print('in get_app', path, current_app.config['DEV_MODE'])
    if current_app.config['DEV_MODE']:
        return proxy(WEBPACK_DEV_SERVER_HOST, "/app/" + path)
    return send_from_directory('app', path)

# Reroutes for when user refresh page
# TODO: dynamic rerouting

# @bp.route("/reader")
# def redirect_reader():
#      return redirect("/reader.html")

@bp.route("/settings")
def redirect_settings():
     return redirect("/settings.html")

@bp.route("/drills")
def redirect_drills():
     return redirect("/drills.html")
    
@bp.route("/api/decks")
def get_decks():
    deck_names = ankiHelper.get_deck_names()
    return jsonify(deck_names)

@bp.route("/api/models")
def get_models():
    model_names = ankiHelper.get_model_names()
    return jsonify(model_names)

@bp.route("/api/fields")
@bp.route("/api/fields/<string:model_name>")
def get_fields(model_name=None):
    field_names = ankiHelper.get_model_field_names(model_name)
    return jsonify(field_names)

@bp.route("/api/reader")
@bp.route("/api/reader/<string:deck_name>")
def reader(deck_name=None):
    offset = request.args.get('offset', type=int, default=0)
    limit = request.args.get('limit', type=int, default=10)
    notes = ankiHelper.get_notes(deck_name, offset, limit)
    return jsonify(notes)

@bp.route("/api/apps")
def get_apps():
    apps = userApps.get_apps()
    return jsonify(apps)
    