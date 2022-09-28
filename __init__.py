import os
from unittest import TextTestRunner
from .server.config import config
from .server.run_server import Server
from aqt.webview import AnkiWebView
from aqt import mw
from aqt.utils import openLink
from aqt.qt import *

# port = 5008
# try:
#     user_config = mw.addonManager.getConfig(__name__)
#     port = user_config['server_port']
# except:
#     pass

# s = Server('0.0.0.0', 5008, dev_mode=config['dev_mode'])

def create_server():
  return Server('0.0.0.0', 5008, dev_mode=config['dev_mode'])

server = create_server()

def restartServer():
  global server
  server.shutdown()
  server = create_server()

if config['dev_mode']:
  action = QAction("Restart AnkiDojo &Server", mw)
  action.setShortcut(QKeySequence("Ctrl+S"))
  action.triggered.connect(restartServer)
  # mw.form.menuTools.addAction(action)

WINDOW_DISPLAY = False
CLIENT_URL = "http://localhost:5008/apps.html"

class AnkiDojoWebView(AnkiWebView):
    def __init__(self):
        AnkiWebView.__init__(self, title="AnkiDojo")
        url = QUrl(CLIENT_URL)
        # self.set_open_links_externally(False)
        self.load_url(url)

def showApp():
    if WINDOW_DISPLAY:
        mw.AnkiDojoApp = AnkiDojoWebView()
        mw.AnkiDojoApp.show()
        mw.AnkiDojoApp.setFocus()
        mw.AnkiDojoApp.activateWindow()
    else:
        openLink(QUrl(CLIENT_URL))


action = QAction("AnkiDojo", mw)
action.setShortcut(QKeySequence("Ctrl+I"))

# set it to call testFunction when it's clicked
action.triggered.connect(showApp)

mw.form.menuTools.addAction(action)