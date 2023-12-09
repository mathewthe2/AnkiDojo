import requests
import re
import base64
import hashlib
from urllib.request import urlopen
from urllib.error import URLError
from urllib.parse import quote

from bs4 import BeautifulSoup
from dataclasses import dataclass, field
from typing import List

from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

# https://github.com/FooSoft/yomichan-anki/blob/b08f8728e83d79034c288e2455eea1693bdb3936/yomi_base/anki_bridge.py
class JapanesePod():

    def get_audio(self, kanji, kana):
        url = 'http://assets.languagepod101.com/dictionary/japanese/audiomp3.php?kanji={}'.format(quote(kanji))
        if kana:
            url += '&kana={}'.format(quote(kana))
        print(url)
        has_error = False
        try:
            resp = urlopen(url)
        except URLError:
            has_error = True

        if resp.code != 200:
            has_error = True

        if not has_error:
            data = resp.read()
            if not self.audioIsPlaceholder(data):
                return url

        return None

    def audioIsPlaceholder(self, data):
        m = hashlib.md5()
        m.update(data)
        return m.hexdigest() == '7e2c2f954ef6051373ba916f000168dc'


# https://github.com/jamesnicolas/yomichan-forvo-server/blob/main/__init__.py
# Config default values
@dataclass
class ForvoConfig():
    port: int = 8770
    language: str = 'ja'
    preferred_usernames: List[str] = field(default_factory=list)
    show_gender: bool = True

    def set(self, config):
        self.__init__(**config)

_forvo_config = ForvoConfig()

class Forvo():
    """
    Forvo web-scraper utility class that matches YomiChan's expected output for a custom audio source
    """
    _SERVER_HOST = "https://forvo.com"
    _AUDIO_HTTP_HOST = "https://audio12.forvo.com"
    def __init__(self, config=_forvo_config):
        self.config = config
        self._set_session()

    def _set_session(self):
        """
        Sets the session with basic backoff retries.
        Put in a separate function so we can try resetting the session if something goes wrong
        """
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["HEAD", "GET", "OPTIONS"]
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session = requests.Session()
        self.session.mount("https://", adapter)
        self.session.mount("http://", adapter)
        # Use my personal user agent to try to avoid scraping detection
        self.session.headers.update(
            {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edg/105.0.1343.27",
                "Accept-Language": "en-US,en;q=0.5",
            }
        )

    def _get(self, path):
        """
        Makes a GET request assuming base url. Creates a new session if something goes wrong
        """
        url = self._SERVER_HOST + path
        try:
            return self.session.get(url, timeout=10).text

        except Exception:
            self._set_session()
            return self.session.get(url, timeout=10).text

    def word(self, w):
        """
        Scrape forvo's word page for audio sources
        """
        w = w.strip()
        if len(w) == 0:
            return []
        path = f"/word/{w}/"
        html = self._get(path)
        soup = BeautifulSoup(html, features="html.parser")

        # Forvo's word page returns multiple result sets grouped by langauge like:
        # <div id="language-container-ja">
        #   <article>
        #       <ul class="show-all-pronunciations">
        #           <li>
        #              <span class="play" onclick"(some javascript to play the word audio)"></span>
        #                "Pronunciation by <span><a href="/username/link">skent</a></span>"
        #              <div class="more">...</div>
        #           </li>
        #       </ul>
        #       ...
        #   </article>
        #   <article id="extra-word-info-76">...</article>
        # </ul>
        # We also filter out ads
        results = soup.select(f"#language-container-{self.config.language}>article>ul.pronunciations-list>li:not(.li-ad)")
        pronunciations = []
        for i in results:
            url = self._extract_url(i.div)

            # Capture the username of the user
            # Some users have deleted accounts which is why can't just parse it from the <a> tag
            username = re.search(r"Pronunciation by([^(]+)\(",i.get_text(strip=True)).group(1).strip()
            pronunciation = {
                'username': username,
                'url': url
            }
            if self.config.show_gender:
                gender = re.search(r"\((Male|Female)",i.get_text(strip=True)).group(1).strip()
                pronunciation['gender'] = gender
            pronunciations.append(pronunciation)
        # Order the list based on preferred_usernames
        if len(self.config.preferred_usernames):
            keys = self.config.preferred_usernames
            def get_index(pronunciation):
                key = pronunciation['username']
                if key in keys:
                    return keys.index(key)
                for i in range(len(pronunciations)):
                    if key == pronunciations[i]['username']:
                        return i + len(keys)
            pronunciations = sorted(pronunciations, key=get_index)
        
        # Transform the list of pronunciations into Yomichan format
        audio_sources = []
        for pronunciation in pronunciations:
            audio_source = {"url":pronunciation['url']}
            genderSymbols = {
                'Male': '♂',
                'Female': '♀'
            }
            genderSymbol = genderSymbols.get(pronunciation.get('gender', ""), "")
            audio_source['name'] = f"Forvo ({genderSymbol}{pronunciation['username']})"
            audio_sources.append(audio_source)
        return audio_sources

    @classmethod
    def _extract_url(cls, element):
        play = element['onclick']
        # We are interested in Forvo's javascript Play function which takes in some parameters to play the audio
        # Example: Play(3060224,'OTQyN...','OTQyN..',false,'Yy9wL2NwXzk0MjYzOTZfNzZfMzM1NDkxNS5tcDM=','Yy9wL...','h')
        # Match anything that isn't commas, parentheses or quotes to capture the function arguments
        # Regex will match something like ["Play", "3060224", ...]
        play_args = re.findall(r"([^',\(\)]+)", play)

        # Forvo has two locations for mp3, /audios/mp3 and just /mp3
        # /audios/mp3 is normalized and has the filename in the 5th argument of Play base64 encoded
        # /mp3 is raw and has the filename in the 2nd argument of Play encoded
        try:
            file = base64.b64decode(play_args[5]).decode("utf-8")
            url = f"{cls._AUDIO_HTTP_HOST}/audios/mp3/{file}"
        # Some pronunciations don't have a normalized version so fallback to raw
        except:
            file = base64.b64decode(play_args[2]).decode("utf-8")
            url = f"{cls._AUDIO_HTTP_HOST}/mp3/{file}"
        return url

    def search(self, s):
        """
        Scrape Forvo's search page for audio sources. Note that the search page omits the username
        """
        s = s.strip()
        if len(s) == 0:
            return []
        path = f"/search/{s}/{self.config.language}/"
        html = self._get(path)
        soup = BeautifulSoup(html, features="html.parser")

        # Forvo's search page returns two result sets like:
        # <ul class="word-play-list-icon-size-l">
        #   <li><span class="play" onclick"(some javascript to play the word audio)"></li>
        # </ul>
        results = soup.select('ul.word-play-list-icon-size-l>li>div.play')
        audio_sources = []
        for i in results:
            url = self._extract_url(i)
            audio_sources.append({"name":"Forvo Search","url":url})
        return audio_sources


class AudioHandler():
    forvo = Forvo(config=_forvo_config)
    jpod = JapanesePod()

    def get_audio_sources(self, expression, reading):
        if not expression:
            return []

        term = expression
        audio_sources = []
        # Try looking for word sources for 'term' first
        audio_sources = self.forvo.word(term)
        # Try looking for word sources for 'reading'
        if len(audio_sources) == 0:
            audio_sources += self.forvo.word(reading)

        # Finally use forvo search to look for similar words
        if len(audio_sources) == 0:
            audio_sources += self.forvo.search(term)

        if len(audio_sources) == 0:
            audio_sources += self.forvo.search(reading)

        jpod_url = self.jpod.get_audio(expression, reading)
        if jpod_url:
            audio_sources.append({
                'name': 'JapanesePod101',
                'url': jpod_url
            })

        return audio_sources

if __name__ == '__main__':
    import concurrent.futures
    handler = AudioHandler()
    data = [
        {
            'expression': '浴びる',
            'reading': 'あびる',
        },
         {
            'expression': '走る',
            'reading': 'はしる',
        },
          {
            'expression': '元',
            'reading': 'もと',
        }
    ]
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        future_to_audio = {executor.submit(handler.get_audio_sources, word['expression'], word['reading']): word for word in data}
        for future in concurrent.futures.as_completed(future_to_audio):
            url = future_to_audio[future]
            try:
                data = future.result()
            except Exception as exc:
                print('%r generated an exception: %s' % (url, exc))
            else:
                print(data)