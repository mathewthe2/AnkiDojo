from enum import Enum

class DictionaryTable(Enum):
    DICTIONARY = 'Dictionary'
    KANJI = 'Kanji'
    KANJI_GLOSS = 'KanjiGloss'
    VOCAB = 'Vocab'
    VOCAB_GLOSS = 'VocabGloss'
    VOCAB_FREQ = 'VocabFreq'
    VOCAB_PITCH = 'VocabPitch'

class DictionaryActive(Enum):
    ENABLED = 1
    DISABLED = 0