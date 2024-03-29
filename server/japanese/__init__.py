
import os.path
from .translate import Translator
from .deinflect import Deinflector
from .dictionary import Dictionary
from .pitch import Pitch
from .audio_handler import AudioHandler
from .morph_util import MorphUtil
from ..utils.singleton import Singleton

directory = os.path.dirname(__file__)
user_files_directory = os.path.join(os.path.dirname(__file__), '..', '..', 'user_files')

class Japanese(metaclass=Singleton):
    def __init__(self):
        self.translator = Translator(
            Deinflector(os.path.join(directory, 'deinflect.json')),
            Dictionary(os.path.join(user_files_directory, 'dictionaries.db')))
        self.pitch = Pitch(os.path.join(user_files_directory, 'dictionaries.db'))
        self.audio_handler = AudioHandler()
        self.morph_util = MorphUtil()