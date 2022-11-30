
from concurrent.futures import as_completed
from concurrent.futures.thread import ThreadPoolExecutor
from ..japanese import Japanese
from ..anki_helper import AnkiHelper
from ..config import config
from flask import Blueprint, Response, jsonify, request

ankiHelper = AnkiHelper(dev_mode=config['dev_mode'])
bp = Blueprint('terms', __name__)

def bool_param(json_body, child):
    return child in json_body and json_body[child] == True

@bp.route("", methods=('GET', 'POST'))
def terms():
    language = Japanese()
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
