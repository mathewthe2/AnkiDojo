import requests

from .util import AnkiHelper
from .user_apps import UserApps
from .japanese import Japanese
from .google_lens import get_google_lens_url

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

@bp.route("/api/primary_deck", methods=('GET', 'POST', 'DELETE'))
def anki_primary_deck():
    if request.method == 'GET':
        primary_deck = ankiHelper.get_primary_deck()
        return jsonify(primary_deck)
    result = None
    content = request.get_json()
    if request.method == "POST":
        if content and "primary_deck" in content:
            result = ankiHelper.update_primary_deck(content["primary_deck"])
        return jsonify(result)
    if request.method == "DELETE":
        return jsonify({}) 

@bp.route("/api/enable_suspended", methods=('GET', 'POST'))
def anki_enable_suspended():
    if request.method == 'GET':
        enable_suspended = ankiHelper.get_enable_suspended()
        return jsonify(enable_suspended)
    result = None
    content = request.get_json()
    if request.method == "POST":
        if content and "enable_suspended" in content:
            result = ankiHelper.update_enable_suspended(content["enable_suspended"])
        return jsonify(result)

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
    
@bp.route("/api/terms", methods=('GET', 'POST'))
def terms():
    language = Japanese() # global declaration does not work for some reason
    result = []
    if request.method == 'GET':
        keyword = request.args.get('keyword', type=str, default='')
        definitions, length = language.translator.findTerm(keyword)
        for exp in definitions:
            exp['glossary'] = list(exp['glossary'])
            result.append(exp)
    elif request.method == "POST":
        content = request.get_json()
        has_one_definition = False
        if content and "keywords" in content:
            keywords = content["keywords"]
            include_pitch_graph = "include_pitch_graph" in content
            for keyword in keywords:
                definitions, length = language.translator.findTerm(keyword)
                if definitions:
                    definitions[0]['glossary'] = list(definitions[0]['glossary'])
                    if (include_pitch_graph):
                        expression = definitions[0]['expression']
                        reading = definitions[0]['reading']
                        definitions[0]['pitch_svg'] = language.pitch.get_svg(expression, reading)
                    result.append(definitions[0])
                    has_one_definition = True
                else:
                    empty_definition = {
                        "expression": "",
                        "reading": "",
                        "glossary": [],
                        "tags": [],
                        "source": "",
                        "rules": []
                    }
                    result.append(empty_definition)
            if not has_one_definition:
                result = []
    return jsonify(result)


@bp.route("/api/google_lens_url", methods=('POST',))
def google_lens_url():
    if request.method == 'POST':
        image_file = request.files.get('file')
        url = get_google_lens_url(image_file)
        return jsonify({'url': url})
        # if 'data' in content:
        #     # image = request.json['data']
        #     image = content['data']
        #     url = get_google_lens_url(image)
        #     return jsonify({'url': url})