import requests
import zipfile
from concurrent.futures import as_completed
from concurrent.futures.thread import ThreadPoolExecutor
from .config import config
from .anki_config import DEFAULT_ANKI_SETTINGS
from .util import AnkiHelper
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

def bool_param(json_body, child):
    return child in json_body and json_body[child] == True

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

@bp.route("/api/dictionaries", methods=('GET', 'POST', 'DELETE'))
def dictionaries():
    dictionary = Dictionary()
    if request.method == 'GET':
        user_dictionaries = dictionary.get_dictionaries()
        return jsonify(user_dictionaries)
    elif request.method == "POST":
        f = request.files['file']
        archive = zipfile.ZipFile(f, 'r')
        dictionary_name = dictionary.add_dictionary(archive)
        return jsonify({"added": dictionary_name})
    return jsonify({"error": "failed to add dictionary"})

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

@bp.route("/api/anki_settings", methods=('GET', 'POST'))
@bp.route("/api/anki_settings/<string:key>", methods=('GET', 'POST'))
def anki_settings(key=None):
    has_valid_key = key in DEFAULT_ANKI_SETTINGS.keys()
    if request.method == 'GET':
        if has_valid_key:
            value = ankiHelper.get_anki_settings(key)
            return jsonify(value)

    result = None
    if request.method == "POST":
        content = request.get_json()
        if has_valid_key and content and "value" in content:
            result = ankiHelper.update_anki_settings(key, content["value"])
        return jsonify(result)

    return jsonify({"error": "Invalid key or value"})

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
        content = request.get_json(cache=True)
        has_one_definition = False
        keywords = []
        keyword_passage_map = {}
        has_passages = content and "passages" in content and content["passages"]
        if has_passages:
            for passage in content["passages"]:
                passage_morph_map, keyword_surface_map, keyword_kana_map  = language.morph_util.get_morphemes_with_sentences(passage)
                for keyword, sentences in passage_morph_map.items():
                    # ensure unqiue keyword but allow multiple sentences per keyword
                    if keyword in keyword_passage_map:
                        keyword_passage_map[keyword] = list(set(sentences + keyword_passage_map[keyword])) 
                    else:
                        keyword_passage_map[keyword] = list(sentences) 
            keywords += keyword_passage_map.keys()

        if content and "keywords" in content:
            user_keywords = content['keywords'] # can have repeats for user input keywords
            keywords += user_keywords
        for keyword in keywords:
            if has_passages and keyword in keyword_kana_map:
                definitions, _ = language.translator.findTermWithReading(keyword, keyword_kana_map[keyword])
            else:
                definitions, _ = language.translator.findTerm(keyword)
            definition = {
                    "expression": "",
                    "reading": "",
                    "surface": "",
                    "glossary": [],
                    "tags": [],
                    "source": "",
                    "rules": [],
                    "sentences": [],
                    "morph_state": ""
            }
            if definitions:
                definition.update(definitions[0])
                definition['glossary'] = list(definitions[0]['glossary'])
                definition['morph_state']= ankiHelper.get_morph_state(definitions[0]['expression'])
                has_one_definition = True
            if has_passages:
                if keyword in keyword_passage_map:
                    definition["sentences"] = keyword_passage_map[keyword]
                if keyword in keyword_surface_map:
                    definition["surface"] = keyword_surface_map[keyword]
            if keyword in user_keywords:
                definition["surface"] = keyword 
            result.append(definition)
        if not has_one_definition: # TODO: handle case for empty definitions but with sentences
            result = []

        include_pitch_graph = bool_param(content, "include_pitch_graph")
        if include_pitch_graph:
            with ThreadPoolExecutor(max_workers=5) as executor:
                future_to_pitch_graph= {executor.submit(language.pitch.get_svg, word['expression'], word['reading']): word for word in result}
                for future in as_completed(future_to_pitch_graph):
                    pitch_graph = future_to_pitch_graph[future]
                    try:
                        pitch_graph_result = future.result()
                    except Exception as exc:
                        print('%r generated an exception: %s' % (pitch_graph, exc))
                    else:
                        for i in range(0, len(result)):
                            if 'pitch_svg' in result[i]:
                                continue
                            if result[i]['expression'] == pitch_graph['expression'] and result[i]['reading'] == pitch_graph['reading']:
                                result[i]['pitch_svg'] = pitch_graph_result
                                break

        include_audio_urls = False
        if "include_audio_urls" in content:
            include_audio_urls = bool_param(content, "include_audio_urls")
        else:
            include_audio_urls = ankiHelper.get_anki_settings("enable_word_audio_search")
        if include_audio_urls:
            with ThreadPoolExecutor(max_workers=5) as executor:
                future_to_audio = {executor.submit(language.audio_handler.get_audio_sources, word['expression'], word['reading']): word for word in result}
                for future in as_completed(future_to_audio):
                    audio_source = future_to_audio[future]
                    try:
                        audio_result = future.result()
                    except Exception as exc:
                        print('%r generated an exception: %s' % (audio_source, exc))
                    else:
                        for i in range(0, len(result)):
                            if 'audio_urls' in result[i]:
                                continue
                            if result[i]['expression'] == audio_source['expression'] and result[i]['reading'] == audio_source['reading']:
                                result[i]['audio_urls'] = audio_result
                                break
                    
    return jsonify(result)

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

# TODO: add other morph states
@bp.route("/api/morphs", methods=('GET', 'POST', 'PUT', 'DELETE'))
def get_known_morphs():
    if request.method == 'GET':
        state = request.args.get('state', type=str, default='')
        if state == 'MORPH_STATE_KNOWN':
            morphs = ankiHelper.get_known_morphs()
            return jsonify(morphs)
        else:
            return jsonify([])
    # Change entire list
    elif request.method == "POST":
        content = request.get_json()
        if content and "MORPH_STATE_KNOWN" in content:
            result = ankiHelper.update_known_morphs(content["MORPH_STATE_KNOWN"])
        return jsonify(result)
    # Add morphs
    elif request.method == "PUT":
        content = request.get_json()
        if content and 'state' in content and 'morphs' in content:
            result = ankiHelper.add_morphs(content["morphs"], content["state"])
        return jsonify(result)
    # Delete morphs
    elif request.method == "DELETE":
        content = request.get_json()
        if content and 'state' in content and 'morphs' in content:
            result = ankiHelper.remove_morphs(content["morphs"], content["state"])
        return jsonify(result)
    
    return jsonify({})


