from aqt import mw
import os
import json

# Paths
user_files_directory = os.path.join(os.path.dirname(__file__), '..', 'user_files')

def get_reader_model_maps():
    with open(os.path.join(user_files_directory, 'reader.json'), 'r') as f:
        reader_config = json.load(f)
    if 'model_maps' in reader_config:
        return reader_config['model_maps']
    else:
        return None
        
try:
    from anki.rsbackend import NotFoundError
except:
    NotFoundError = Exception

class AnkiHelper():
    def __init__(self):
        pass

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

    # def media(self):
    #     media = self.collection().media
    #     if media is None:
    #         raise Exception('media is not available')

    #     return media

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

    def get_notes(self, deck_name, offset=0, limit=10):
        note_ids = self.collection().find_notes('deck:"{}"'.format(deck_name))
        note_ids_requested = note_ids[offset:offset+limit]
        result = []
        for note_id in note_ids_requested:
            try:
                note = self.collection().get_note(note_id)
                model = note.model()

                model_maps = get_reader_model_maps()
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
            "offset": offset,
            "limit": limit,
            "data": result
        }