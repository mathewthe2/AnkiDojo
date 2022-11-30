
import zipfile
from ..dictionary import Dictionary
from flask import Blueprint, Response, jsonify, request

bp = Blueprint('dictionaries', __name__)

@bp.route("", methods=('GET', 'POST', 'PUT', 'DELETE'))
def dictionary_controller():
    dictionary = Dictionary()
    if request.method == 'GET':
        try:
            user_dictionaries = dictionary.get_dictionaries()
            return jsonify(user_dictionaries)
        except:
            return jsonify({"error": "failed to fetch dictionaries"}) 
    elif request.method == "PUT":
        content = request.get_json()
        if content and "id" in content and "enabled" in content:
            result = dictionary.set_enabled(content["id"], content["enabled"])
            return jsonify(result)
        else:
            return jsonify({"error": "failed to update dictionary"})
    elif request.method == "POST":
        try:
            f = request.files['file']
            archive = zipfile.ZipFile(f, 'r')
            new_dictionary = dictionary.add_dictionary(archive)
            return jsonify(new_dictionary)
        except:
            return jsonify({"error": "failed to add dictionary"})
    elif request.method == 'DELETE':
        content = request.get_json()
        if content and "id" in content:
            try:
                result = dictionary.remove_dictionary(content["id"])
                return jsonify(result)
            except:
                return jsonify({"error": "failed to delete dictionary"}) 
        else:
            return jsonify({"error": "missing id in request"})
    return jsonify({"error": "failed to process request"})
