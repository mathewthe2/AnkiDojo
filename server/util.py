from aqt import mw
import os
import json
import random
from .settings import AnkiSettings, MorphSettings
from .anki_connect import AnkiConnect

# Paths
user_files_directory = os.path.join(os.path.dirname(__file__), '..', 'user_files')

try:
    from anki.rsbackend import NotFoundError
except:
    NotFoundError = Exception

class AnkiHelper():
    def __init__(self, dev_mode=False):
        self.settings = AnkiSettings('ankiSettings.json' if not dev_mode else 'ankiDevSettings.json')
        self.morph_settings = MorphSettings()
        self.ankiConnect = AnkiConnect()

    def collection(self):
        collection = mw.col
        if collection is None:
            raise Exception('collection is not available')

        return collection

    def media_server(self):
        media_server = mw.mediaServer
        if media_server is None:
            raise Exception('mediaServer is not available')

        return media_server

    def get_deck_names(self):
        deck_names = [l['name'] for l in self.collection().decks.all()]
        return deck_names

    def get_model_names(self):
        model_names = [l['name'] for l in self.collection().models.all()]
        return model_names

    def get_model_field_names(self, model_name):
        model = next(model for model in self.collection().models.all() if model['name'] == model_name)
        field_names = self.collection().models.field_names(model)
        return field_names

    def get_model_maps(self):
        user_models = self.get_model_names()
        anki_settings = self.settings.settings_data
        if 'model_maps' in anki_settings:
            all_model_maps = anki_settings['model_maps']
            return [{model: model_map} for model, model_map in all_model_maps.items() if model in user_models]
        return []

    def update_model_map(self, model_name, model_map):
        return self.settings.update_anki_model_map(model_name, model_map)

    def get_primary_deck(self):
        anki_settings = self.settings.settings_data
        if "primary_deck" in anki_settings:
            return anki_settings["primary_deck"]
        else:
            return ""
    
    def update_primary_deck(self, primary_deck):
        return self.settings.update_settings_data({'primary_deck': primary_deck})

    def get_enable_suspended(self):
        anki_settings = self.settings.settings_data
        if "enable_suspended" in anki_settings:
            return anki_settings["enable_suspended"]
        else:
            return True
    
    def update_enable_suspended(self, enable_suspended):
        return self.settings.update_settings_data({'enable_suspended': enable_suspended})

    def search_notes(self, keyword, deck_name='', extra_filter='', shuffle=False, offset=0, limit=10):
        models = self.settings.get_models()
        model_filter_string = '({})'.format(' OR '.join(['"note:{}"'.format(model) for model in models])) if models else ''
        query_string = keyword
        enable_suspended = self.get_enable_suspended()
        if model_filter_string:
            query_string += ' ' + model_filter_string
        if deck_name:
            query_string = 'deck:{} {}'.format(deck_name, query_string)
        if extra_filter:
            query_string += ' ' + extra_filter
        if not enable_suspended:
            query_string += ' ' '-is:suspended'
        note_ids = self.collection().find_notes(query_string)
        # note_ids = self.collection().find_notes('deck:"{}" {} {}'.format(deck_name, keyword, model_filter_string))
        if shuffle:
            random.shuffle(note_ids)
        note_ids_requested = note_ids[offset:offset+limit]
        result = []
        for note_id in note_ids_requested:
            try:
                note = self.collection().get_note(note_id)
                model = note.model()
                model_maps = self.settings.settings_data['model_maps']
                if model['name'] in model_maps:
                    field_map = model_maps[model['name']]
                    fields = {}
                    for info in model['flds']:
                        name = info['name']
                        if name in field_map:
                            order = info['ord']
                            value = note.fields[order]
                            if "<img src=" in value:
                                file_name = value.split('<img src=\"')[1].split('">')[0]
                                value = 'http://127.0.0.1:{}/{}'.format(self.media_server().getPort(), file_name)
                            if "[sound:" in value:
                                file_name = value.split('[sound:')[1].split(']')[0]
                                value = 'http://127.0.0.1:{}/{}'.format(self.media_server().getPort(), file_name)
                            elif ".mp3" in value:
                                value = 'http://127.0.0.1:{}/{}'.format(self.media_server().getPort(), value)
                            fields[field_map[name]] = value
                            
                    result.append({
                        'noteId': note.id,
                        'mediaDirectory': self.media_server().getPort(),
                        'tags' : note.tags,
                        'fields': fields,
                        'modelName': model['name'],
                        'cards': self.collection().db.list('select id from cards where nid = ? order by ord', note.id)
                    })
            except NotFoundError:
                # Anki will give a NotFoundError if the note ID does not exist.
                # Best behavior is probably to add an 'empty card' to the
                # returned result, so that the items of the input and return
                # lists correspond.
                result.append({})   
        return {
            "total": len(note_ids),
            "query": query_string,
            "offset": offset,
            "limit": limit,
            "data": result
        }

    def add_notes(self, notes):
        # TODO: add media
        for note in notes:
            # ankiConnectNote = {
            #     'fields': note['fields']
            # }
            self.ankiConnect.addNote(note)

    def get_known_morphs(self):
        return self.morph_settings.get_known_morphs()
    
    def add_known_morphs(self, morphs):
        return self.morph_settings.add_known_morphs(morphs)

    def get_morph_state(self, morph):
        # TODO: get other morph states apart from known
        known_morphs = self.morph_settings.get_known_morphs()
        return 'MORPH_STATE_KNOWN' if morph in known_morphs else ''

    