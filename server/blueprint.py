import requests
from .config import config
from .anki_helper import AnkiHelper
from .user_apps import UserApps
from .japanese import Japanese
from .dictionary import Dictionary
from .google_lens import get_google_lens_url
from .scraper import Scraper
from .simple_websocket import Server, ConnectionClosed
from flask import (
    Blueprint, Response, current_app, jsonify, redirect, request, redirect, send_from_directory, stream_with_context
)

# from .db import get_db

WEBPACK_DEV_SERVER_HOST = "http://localhost:8080"
session = requests.Session()
ankiHelper = AnkiHelper(dev_mode=config['dev_mode'])
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

@bp.route('/echo', websocket=True)
def echo():
    ws = Server(request.environ)
    try:
        while True:
            data = ws.receive()
            ws.send(data)
    except ConnectionClosed:
        pass
    return ''

@bp.route('/')
def index():
    return redirect("/apps.html")
    
@bp.route("/p/<path:path>", methods=('GET',))
def online_proxy(path):
    scraper = Scraper()
    req = scraper.get(path)
    return Response(stream_with_context(req.iter_content()), content_type = req.headers['content-type'])

@bp.route("/apps/<path:path>")
def get_media(path):
    return send_from_directory('data/user_apps', path)

@bp.route("/", defaults={"path": "index.html"})
@bp.route("/<path:path>")
def get_app(path):
    # print('in get_app', path, current_app.config['DEV_MODE'])
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

@bp.route("/api/decks")
def get_decks():
    deck_names = ankiHelper.get_deck_names()
    return jsonify(deck_names)

@bp.route("/api/models")
def get_models():
    model_names = ankiHelper.get_model_names()
    return jsonify(model_names)

@bp.route("/api/card_formats", methods=('GET', 'POST', 'DELETE'))
def card_formats():
    if request.method == 'GET':
        model_maps = ankiHelper.get_model_maps()
        return jsonify(model_maps)
    
    result = None
    content = request.get_json()
    if request.method == "POST":
        if content and "model_name" in content and "model_map" in content:
            result = ankiHelper.update_model_map(content["model_name"], content["model_map"])
        return jsonify(result)
    if request.method == 'DELETE':
        if content and "model_name" in content:
            result = ankiHelper.update_model_map(content["model_name"], {})
        return jsonify(result)

# DEPRECATED - to remove
@bp.route("/api/primary_deck", methods=('GET', 'POST', 'DELETE'))
def anki_primary_deck():
    if request.method == 'GET':
        primary_deck = ankiHelper.get_primary_deck()
        return jsonify(primary_deck) if primary_deck else jsonify({})
    result = None
    content = request.get_json()
    if request.method == "POST":
        if content and "primary_deck" in content:
            result = ankiHelper.update_primary_deck(content["primary_deck"])
        return jsonify(result)
    if request.method == "DELETE":
        return jsonify({}) 

@bp.route("/api/fields")
@bp.route("/api/fields/<string:model_name>")
def get_fields(model_name=None):
    field_names = ankiHelper.get_model_field_names(model_name)
    return jsonify(field_names)

@bp.route("/api/notes", methods=('GET', 'POST'))
def notes():
    if request.method == 'GET': ## search notes
        keyword = request.args.get('keyword', type=str, default='')
        deck_name = request.args.get('deck_name', type=str, default='')
        shuffle = request.args.get('shuffle', type=bool, default=False)
        extra_filter = request.args.get('extra_filter', type=str, default='')
        offset = request.args.get('offset', type=int, default=0)
        limit = request.args.get('limit', type=int, default=10)
        notes = ankiHelper.search_notes(keyword, deck_name, extra_filter, shuffle, offset, limit)
        return jsonify(notes)
    elif request.method == 'POST':
        content = request.get_json()
        result = []
        if content and "notes" in content:
            result = ankiHelper.add_notes(content["notes"])
        return jsonify(result)
    
@bp.route("/api/apps")
def get_apps():
    is_community = request.args.get('community', type=bool, default=False)
    apps = userApps.get_community_apps() if is_community else userApps.get_apps()
    return jsonify(apps)

@bp.route("/api/mecab_support")
def has_mecab_support():
    language = Japanese()
    has_mecab = language.morph_util.has_mecab()
    return jsonify({'has_mecab': has_mecab})

@bp.route("/api/google_lens_url", methods=('POST',))
def google_lens_url():
    if request.method == 'POST':
        image_file = request.files.get('file')
        url = get_google_lens_url(image_file)
        return jsonify({'url': url})
