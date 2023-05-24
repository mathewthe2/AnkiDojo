import aqt
import anki
import enum
import base64
import hashlib

anki_version = tuple(int(segment) for segment in aqt.appVersion.split("."))

if anki_version < (2, 1, 45):
    raise Exception("Minimum Anki version supported: 2.1.45")

# This is a modified version of AnkiConnect
# that extends single add_note operations to support batch add_note operations
# For example, a duplicate card error is logged but not raised as an exception
# https://github.com/FooSoft/anki-connect/blob/master/plugin/__init__.py

class AnkiConnect():
    def __init__(self):
        pass

    def addNotes(self, notes):
        if len(notes) == 0:
            return []
        ankiNotes = []
        skippedNotes = []
        deck_id = self._getDeckId(notes[0])
        for note in notes:
            try:
                ankiNote = self.createNote(note, deck_id)
            except Exception as e:
                print("Failed to add note:", str(e))
            else:
                if ankiNote:
                    self.addMediaFromNote(ankiNote, note)
                    ankiNotes.append(ankiNote)
                else:
                    skippedNotes.append(note['fields'])
        if len(ankiNotes) > 0:
            deck_id = ankiNotes[0].model()['did']
            self.add_notes_batch(ankiNotes, deck_id)
        return ankiNotes, skippedNotes
    
    # Add note with UI update: aqt.operations.note.add_note()
    # Add note without UI update: collection.add_note()
    # The current band-aid solution is to add all notes without UI update and add the last note with UI update.
    # If we simply loop through all card additions with UI updates, that will cause the app to crash.
    def add_notes_batch(self, ankiNotes, deck_id):
        collection = self.collection()
        # Add every card without UI update to prevent 
        for ankiNote in ankiNotes[:-1]:
            collection.add_note(ankiNote, deck_id)
        # Add card with UI update
        aqt.operations.note.add_note(parent=self.window(), note=ankiNotes[-1], target_deck_id=deck_id).run_in_background()
        collection.autosave()
    
    def media(self):
        media = self.collection().media
        if media is None:
            raise Exception('media is not available')

        return media

    def addMediaFromNote(self, ankiNote, note):
        audioObjectOrList = note.get('audio')
        self.addMedia(ankiNote, audioObjectOrList, MediaType.Audio)

        videoObjectOrList = note.get('video')
        self.addMedia(ankiNote, videoObjectOrList, MediaType.Video)

        pictureObjectOrList = note.get('picture')
        self.addMedia(ankiNote, pictureObjectOrList, MediaType.Picture)

    # deprecated
    # def startEditing(self):
    #     self.window().requireReset()

    # deprecated
    # def stopEditing(self):
    #     if self.collection() is not None:
    #         self.window().maybeReset()

    def _getDeckId(self, note):
        deck = self.collection().decks.byName(note['deckName'])
        if deck is None:
            raise Exception('deck was not found: {}'.format(note['deckName']))

    def _getModelId(self, note):
       deck = self.collection().decks.byName(note['deckName'])
       if deck is None:
           raise Exception('deck was not found: {}'.format(note['deckName']))
       return deck['id']
            
    def window(self):
        return aqt.mw

    def collection(self):
        collection = self.window().col
        if collection is None:
            raise Exception('collection is not available')

        return collection

    def createNote(self, note, deck_id):
        collection = self.collection()

        model = collection.models.byName(note['modelName'])
        if model is None:
            raise Exception('model was not found: {}'.format(note['modelName']))

        ankiNote = anki.notes.Note(collection, model)
        ankiNote.model()['did'] = deck_id
        if 'tags' in note:
            ankiNote.tags = note['tags']

        for name, value in note['fields'].items():
            for ankiName in ankiNote.keys():
                if name.lower() == ankiName.lower():
                    ankiNote[ankiName] = value
                    break

        allowDuplicate = False
        duplicateScope = None
        duplicateScopeDeckName = None
        duplicateScopeCheckChildren = False
        duplicateScopeCheckAllModels = False

        if 'options' in note:
            options = note['options']
            if 'allowDuplicate' in options:
                allowDuplicate = options['allowDuplicate']
                if type(allowDuplicate) is not bool:
                    raise Exception('option parameter "allowDuplicate" must be boolean')
            if 'duplicateScope' in options:
                duplicateScope = options['duplicateScope']
            if 'duplicateScopeOptions' in options:
                duplicateScopeOptions = options['duplicateScopeOptions']
                if 'deckName' in duplicateScopeOptions:
                    duplicateScopeDeckName = duplicateScopeOptions['deckName']
                if 'checkChildren' in duplicateScopeOptions:
                    duplicateScopeCheckChildren = duplicateScopeOptions['checkChildren']
                    if type(duplicateScopeCheckChildren) is not bool:
                        raise Exception('option parameter "duplicateScopeOptions.checkChildren" must be boolean')
                if 'checkAllModels' in duplicateScopeOptions:
                    duplicateScopeCheckAllModels = duplicateScopeOptions['checkAllModels']
                    if type(duplicateScopeCheckAllModels) is not bool:
                        raise Exception('option parameter "duplicateScopeOptions.checkAllModels" must be boolean')

        duplicateOrEmpty = self.isNoteDuplicateOrEmptyInScope(
            ankiNote,
            deck_id,
            collection,
            duplicateScope,
            duplicateScopeDeckName,
            duplicateScopeCheckChildren,
            duplicateScopeCheckAllModels
        )

        if duplicateOrEmpty == 1:
            return None # raise Exception('cannot create note because it is empty')
        elif duplicateOrEmpty == 2:
            if allowDuplicate:
                return ankiNote
            return None # raise Exception('cannot create note because it is a duplicate')
        elif duplicateOrEmpty == 0:
            return ankiNote
        else:
            return None # raise Exception('cannot create note for unknown reason')

    def isNoteDuplicateOrEmptyInScope(
        self,
        note,
        deck_id,
        collection,
        duplicateScope,
        duplicateScopeDeckName,
        duplicateScopeCheckChildren,
        duplicateScopeCheckAllModels
    ):
        # Returns: 1 if first is empty, 2 if first is a duplicate, 0 otherwise.

        # note.dupeOrEmpty returns if a note is a global duplicate with the specific model.
        # This is used as the default check, and the rest of this function is manually
        # checking if the note is a duplicate with additional options.
        if duplicateScope != 'deck' and not duplicateScopeCheckAllModels:
            return note.dupeOrEmpty() or 0

        # Primary field for uniqueness
        val = note.fields[0]
        if not val.strip():
            return 1
        csum = anki.utils.fieldChecksum(val)

        # Create dictionary of deck ids
        dids = None
        if duplicateScope == 'deck':
            did = deck_id
            if duplicateScopeDeckName is not None:
                deck2 = collection.decks.byName(duplicateScopeDeckName)
                if deck2 is None:
                    # Invalid deck, so cannot be duplicate
                    return 0
                did = deck2['id']

            dids = {did: True}
            if duplicateScopeCheckChildren:
                for kv in collection.decks.children(did):
                    dids[kv[1]] = True

        # Build query
        query = 'select id from notes where csum=?'
        queryArgs = [csum]
        if note.id:
            query += ' and id!=?'
            queryArgs.append(note.id)
        if not duplicateScopeCheckAllModels:
            query += ' and mid=?'
            queryArgs.append(note.mid)

        # Search
        for noteId in note.col.db.list(query, *queryArgs):
            if dids is None:
                # Duplicate note exists in the collection
                return 2
            # Validate that a card exists in one of the specified decks
            for cardDeckId in note.col.db.list('select did from cards where nid=?', noteId):
                if cardDeckId in dids:
                    return 2

        # Not a duplicate
        return 0

    def addMedia(self, ankiNote, mediaObjectOrList, mediaType):
        if mediaObjectOrList is None:
            return

        if isinstance(mediaObjectOrList, list):
            mediaList = mediaObjectOrList
        else:
            mediaList = [mediaObjectOrList]

        for media in mediaList:
            if media is not None and len(media['fields']) > 0:
                try:
                    mediaFilename = self.storeMediaFile(media['filename'],
                                                        data=media.get('data'),
                                                        path=media.get('path'),
                                                        url=media.get('url'),
                                                        skipHash=media.get('skipHash'),
                                                        deleteExisting=media.get('deleteExisting'))

                    if mediaFilename is not None:
                        for field in media['fields']:
                            if field in ankiNote:
                                if mediaType is MediaType.Picture:
                                    ankiNote[field] += u'<img src="{}">'.format(mediaFilename)
                                elif mediaType is MediaType.Audio or mediaType is MediaType.Video:
                                    ankiNote[field] += u'[sound:{}]'.format(mediaFilename)

                except Exception as e:
                    errorMessage = str(e).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                    for field in media['fields']:
                        if field in ankiNote:
                            ankiNote[field] += errorMessage

    def storeMediaFile(self, filename, data=None, path=None, url=None, skipHash=None, deleteExisting=True):
        if not (data or path or url):
            raise Exception('You must provide a "data", "path", or "url" field.')
        if data:
            mediaData = base64.b64decode(data)
        elif path:
            with open(path, 'rb') as f:
                mediaData = f.read()
        elif url:
            mediaData = download(url)

        if skipHash is None:
            skip = False
        else:
            m = hashlib.md5()
            m.update(mediaData)
            skip = skipHash == m.hexdigest()

        if skip:
            return None
        if deleteExisting:
            self.deleteMediaFile(filename)
        return self.media().writeData(filename, mediaData)

# https://github.com/FooSoft/anki-connect/blob/master/plugin/util.py

class MediaType(enum.Enum):
    Audio = 1
    Video = 2
    Picture = 3

DEFAULT_CONFIG = {
    'apiKey': None,
    'apiLogPath': None,
    'apiPollInterval': 25,
    'apiVersion': 6,
    'webBacklog': 5,
    'webBindAddress': '127.0.0.1',
    'webBindPort': 5008, # use anki dojo port instead of ankiconnet's port
    'webCorsOrigin': None,
    'webCorsOriginList': ['http://localhost'],
    'ignoreOriginList': [],
    'webTimeout': 10000,
}

def setting(key):
    try:
        return aqt.mw.addonManager.getConfig(__name__).get(key, DEFAULT_CONFIG[key])
    except:
        raise Exception('setting {} not found'.format(key))

def download(url):
    client = anki.sync.AnkiRequestsClient()
    client.timeout = setting('webTimeout') / 1000

    resp = client.get(url)
    if resp.status_code != 200:
        raise Exception('{} download failed with return code {}'.format(url, resp.status_code))

    return client.streamContent(resp)