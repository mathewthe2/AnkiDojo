import os

from flask import Flask
from flask_cors import CORS
from logging.config import dictConfig

# Direct Flask's logging to sys.stdout instead of sys.stderr
dictConfig({
    'version': 1,
    'formatters': {'default': {
        'format': '[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
    }},
    'handlers': {'wsgi': {
        'class': 'logging.StreamHandler',
        'stream': 'ext://sys.stdout',
        'formatter': 'default'
    }},
    'root': {
        'level': 'INFO',
        'handlers': ['wsgi']
    }
})

def create_flask_app(test_config=None, dev_mode=False):
    if dev_mode:
        print('Starting app in dev mode')
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        DEV_MODE=dev_mode,
        SECRET_KEY='dev',
        JSON_SORT_KEYS=False,
        # DATABASE=os.path.join(instance_dir, 'card_mine.sqlite3'),
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # from . import db
    # db.init_app(app)

    import importlib
    from . import blueprint
    from .controllers import anki_settings_controller, dictionary_controller, morphs_controller, terms_controller

    importlib.reload(blueprint) # support hot reload of the blueprint
    app.register_blueprint(blueprint.bp, dev_mode=dev_mode)
    app.register_blueprint(dictionary_controller.bp, url_prefix='/api/dictionaries', dev_mode=dev_mode)
    app.register_blueprint(morphs_controller.bp, url_prefix='/api/morphs', dev_mode=dev_mode)
    app.register_blueprint(terms_controller.bp, url_prefix='/api/terms', dev_mode=dev_mode)
    app.register_blueprint(anki_settings_controller.bp, url_prefix='/api/anki_settings', dev_mode=dev_mode)
    app.add_url_rule('/', endpoint='index')

    CORS(app)

    return app
