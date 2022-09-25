import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

# https://github.com/jamesnicolas/yomichan-forvo-server/blob/main/__init__.py
class Scraper():

    def __init__(self):
        self._set_session()

    def get(self, url):
        """
        Makes a GET request assuming base url. Creates a new session if something goes wrong
        """
        try:
            return self.session.get(url, stream=True, timeout=10)

        except Exception:
            self._set_session()
            return self.session.get(url, stream=True, timeout=10)

    def _set_session(self):
        """
        Sets the session with basic backoff retries.
        Put in a separate function so we can try resetting the session if something goes wrong
        """
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            method_whitelist=["HEAD", "GET", "OPTIONS"]
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