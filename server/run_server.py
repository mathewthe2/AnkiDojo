import threading
import os

from flask import Flask
from flask_cors import CORS
from werkzeug.serving import make_server

from .flask_app import create_flask_app
from .config import config

class Server:
  def __init__(self, host, port, dev_mode=False):
    self.host = host
    self.port = port
    self.app = create_flask_app(dev_mode=dev_mode)

    self.srv = make_server(host=self.host, port=self.port, app=self.app)
    self.srv.daemon_threads = True
    self.server_thread = threading.Thread(target=self.run, daemon=True)
    self.server_thread.start()

  def run(self):
    host = 'localhost' if self.host == '0.0.0.0' else self.host
    print(f"Running server at http://{host}:{self.port}")
    self.srv.serve_forever()

  def shutdown(self):
    self.srv.shutdown()
    self.wait()

  def wait(self):
    while self.server_thread.is_alive():
      self.server_thread.join(1.0)
