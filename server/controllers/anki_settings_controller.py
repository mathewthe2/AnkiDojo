
import zipfile
from ..anki_config import DEFAULT_ANKI_SETTINGS
from ..anki_helper import AnkiHelper
from ..config import config
from flask import Blueprint, Response, jsonify, request

ankiHelper = AnkiHelper(dev_mode=config['dev_mode'])
bp = Blueprint('anki_settings', __name__)

@bp.route("", methods=('GET', 'POST'))
@bp.route("/<string:key>", methods=('GET', 'POST'))
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