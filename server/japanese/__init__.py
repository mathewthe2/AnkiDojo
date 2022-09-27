
import os.path
from .translate import Translator
from .deinflect import Deinflector
from .dictionary import Dictionary
from .pitch import Pitch
from .audio_handler import AudioHandler
from .morph_util import MorphUtil

directory = os.path.dirname(__file__)

class Japanese():
    def __init__(self):
        self.translator = Translator(
            Deinflector(os.path.join(directory, 'deinflect.json')),
            Dictionary(os.path.join(directory, 'dictionary.db')))
        self.pitch = Pitch(os.path.join(directory, 'pitch_accents.sqlite'))
        self.audio_handler = AudioHandler()
        self.morph_util = MorphUtil()