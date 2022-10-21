import collections
import importlib
import importlib.util
import functools
import re
import subprocess
import sys
import threading
from .reader_util import findSentence
from .util import kaner

# Credit to ianki
# https://github.com/ianki/AnkiMine
class MorphUtil():

    MECAB_POS_BLACKLIST = [
        'UNK',  # unknown morph
        '記号',  # "symbol", generally punctuation
        '補助記号',  # "symbol", generally punctuation
        '空白',  # Empty space
        '助詞', # Particles
        '助動詞', # Auxiliary verbs
    ]
    MECAB_SUBPOS_BLACKLIST = [
        '数詞',  # Numbers
    ]

    def get_morphemes(self, expression):
        with morphemizer_lock():
            morphemes = set()
            morphs = getRawMorphemesFromExpr(expression)
            for m in morphs:
                if m.pos1 in self.MECAB_POS_BLACKLIST or \
                m.pos2 in self.MECAB_SUBPOS_BLACKLIST:
                    continue
                morphemes.add(m.lemma + ' (' + m.kanaBase + ')' + ': ' + m.pos1 + ', ' + m.pos2)
            return morphemes

    def get_morphemes_with_sentences(self, expression):
         with morphemizer_lock():
            morpheme_map = {}
            surface_map = {}
            kana_map = {}
            morphs = getRawMorphemesFromExpr(expression)
            for m in morphs:
                if m.pos1 in self.MECAB_POS_BLACKLIST or \
                m.pos2 in self.MECAB_SUBPOS_BLACKLIST:
                    continue
                if m.lemma not in morpheme_map:
                    morpheme_map[m.lemma] = set()
                morpheme_map[m.lemma].add(findSentence(expression, expression.find(m.surface)))
                surface_map[m.lemma] = m.surface
                kana_map[m.lemma] = kaner(m.kanaBase, True)
            return morpheme_map, surface_map, kana_map

    def has_mecab(self):
        try:
            p, _ = _mecab()
        except:
            return False
        else:
            return True


# List of features in Unidic 22 format dictionary
# f[0]:  pos1
# f[1]:  pos2
# f[2]:  pos3
# f[3]:  pos4
# f[4]:  cType
# f[5]:  cForm
# f[6]:  lForm
# f[7]:  lemma
# f[8]:  orth
# f[9]:  pron
# f[10]: orthBase
# f[11]: pronBase
# f[12]: goshu
# f[13]: iType
# f[14]: iForm
# f[15]: fType
# f[16]: fForm
# f[17]: iConType
# f[18]: fConType
# f[19]: type
# f[20]: kana
# f[21]: kanaBase
# f[22]: form
# f[23]: formBase
# f[24]: aType
# f[25]: aConType
# f[26]: aModType
# f[27]: lid
# f[28]: lemma_id

Unidic22Morph = collections.namedtuple('Unidic22Morph',
    'surface pos1 pos2 pos3 pos4 cType cForm lForm lemma orth pron orthBase'
    ' pronBase goshu iType iForm fType fForm iConType fConType type kana'
    ' kanaBase form formBase aType aConType aModType lid lemma_id')

MECAB_NODE_UNIDIC_22_BOS = 'BOS/EOS,*,*,*,*,*,*,*,*,*,*,*,*,*,*,*,*'
MECAB_NODE_UNIDIC_22_PARTS = ['%f[7]', '%f[10]', '%m', '%f[6]', '%f[0]', '%f[1]', '%f[20]', '%f[21]']

MECAB_NODE_UNIDIC_22_ALL_PARTS         = ['%m'] + [f'%f[{x}]' for x in range(0, 29)]
#                                          surf 0    1      2   3   4   5  6   7     8   9   10    11  12  13  14  15  16  17  18  19  20  21  22  23  24  25  26  27  28
MECAB_NODE_UNIDIC_22_ALL_UNKNOWN_PARTS = ['%m', 'UNK', '', '', '', '', '', '', '%m', '', '', '%m', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

control_chars_re = re.compile('[\x00-\x1f\x7f-\x9f]')


# [Str] -> subprocess.STARTUPINFO -> IO MecabProc
def _spawnMecab(base_cmd, startupinfo):
    """Try to start a MeCab subprocess in the given way, or fail.

    Raises OSError if the given base_cmd and startupinfo don't work
    for starting up MeCab, or the MeCab they produce has a dictionary
    incompatible with our assumptions.
    """
    global MECAB_ENCODING
    global is_unidic

    # [Str] -> subprocess.STARTUPINFO -> IO subprocess.Popen
    def spawnCmd(cmd, startupinfo):
        return subprocess.Popen(cmd, startupinfo=startupinfo, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                stderr=subprocess.STDOUT)

    config_dump = spawnCmd(base_cmd + ['-P'], startupinfo).stdout.read()
    #print('config_dump', config_dump)
    bos_feature_match = re.search(
        '^bos-feature: (.*)$', str(config_dump, 'utf-8'), flags=re.M)

    if bos_feature_match is not None and bos_feature_match.group(1).strip() == MECAB_NODE_UNIDIC_22_BOS:
        print('using MECAB_NODE_UNIDIC_22_ALL_PARTS')
        node_parts = MECAB_NODE_UNIDIC_22_ALL_PARTS
        unk_parts = MECAB_NODE_UNIDIC_22_ALL_UNKNOWN_PARTS
        is_unidic = True
    else:
        raise OSError(
            "Unexpected MeCab dictionary format; unidic format 22 is required.\n"
            "Try installing the 'Mecab Unidic' addons, from\n"
            "https://github.com/ianki/MecabUnidic/releases\n"
            "or if using your system's `mecab` try installing a the unidic package\n")

    dicinfo_dump = spawnCmd(base_cmd + ['-D'], startupinfo).stdout.read()
    charset_match = re.search(
        '^charset:\t(.*)$', str(dicinfo_dump, 'utf-8'), flags=re.M)
    if charset_match is None:
        raise OSError('Can\'t find charset in MeCab dictionary info (`$MECAB -D`):\n\n'
                      + dicinfo_dump)
    MECAB_ENCODING = charset_match.group(1)

    args = ['--node-format=%s\r' % ('\t'.join(node_parts),),
            '--unk-format=%s\r' % ('\t'.join(unk_parts),),
            '--eos-format=EOS\n',
            '-b 819200' # max buffer size for mecab
            ]
    return spawnCmd(base_cmd + args, startupinfo)


@functools.lru_cache
def _mecab():  # IO MecabProc
    """Start a MeCab subprocess and return it.
    `mecab` reads expressions from stdin at runtime, so only one
    instance is needed.  That's why this function is memoized.
    """

    global mecab_source # make it global so we can query it later

    if sys.platform.startswith('win'):
        si = subprocess.STARTUPINFO()
        try:
            si.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        except:
            # pylint: disable=no-member
            si.dwFlags |= subprocess._subprocess.STARTF_USESHOWWINDOW
    else:
        si = None

    # Search for mecab
    reading = None

    # 1st priority - MecabUnidic
    if importlib.util.find_spec('MecabUnidic'):
        try:
            reading = importlib.import_module('MecabUnidic.reading')
            mecab_source = 'MecabUnidic from addon MecabUnidic'
        except ModuleNotFoundError:
            pass

    # 6th priority - system mecab
    if not reading:
        try:
            return _spawnMecab(['mecab'], si), 'System'
        except Exception as e:
            raise OSError('''
            Mecab Unidic dictionary could not be found.
            Please install the latest add-on from
                 https://github.com/ianki/MecabUnidic/releases''') from e

    m = reading.MecabController()
    m.setup()
    # m.mecabCmd[1:4] are assumed to be the format arguments.
    print('Using mecab: [%s] with command line [%s]' % (mecab_source, m.mecabCmd))

    return _spawnMecab(m.mecabCmd[:1] + m.mecabCmd[4:], si), mecab_source


def _interact(expr):  # Str -> IO Str
    """ "interacts" with 'mecab' command: writes expression to stdin of 'mecab' process and gets all the morpheme
    info from its stdout. """
    p, _ = _mecab()
    expr = expr.encode(MECAB_ENCODING, 'ignore')
    p.stdin.write(expr + b'\n')
    p.stdin.flush()

    return '\r'.join([str(p.stdout.readline().rstrip(b'\r\n'), MECAB_ENCODING) for l in expr.split(b'\n')])


def getRawMorphemesFromExpr(e):
    # Remove Unicode control codes before sending to MeCab.
    e = control_chars_re.sub('', e)
    ms = [m.split('\t') for m in _interact(e).split('\r')]
    ms = [Unidic22Morph(*m) for m in ms if len(m) > 1]
    return ms

_morphemizer_lock = threading.RLock()

def morphemizer_lock():
  return _morphemizer_lock
