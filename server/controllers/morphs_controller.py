from ..anki_helper import AnkiHelper
from ..config import config
from flask import Blueprint, Response, jsonify, request

ankiHelper = AnkiHelper(dev_mode=config['dev_mode'])
bp = Blueprint('morphs', __name__)

# TODO: add other morph states
@bp.route("", methods=('GET', 'POST', 'PUT', 'DELETE'))
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
