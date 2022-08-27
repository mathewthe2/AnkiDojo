import argparse

from .config import config
from .run_server import Server

parser = argparse.ArgumentParser(description='Anki Dojo server utility')
parser.add_argument('--dev', action='store_true', help='Developer mode, enables hot reload from a webpack server.')
parser.add_argument('command', choices=['serve', 'init-collection', 'init-morphs', 'init-known'])
args = parser.parse_args()

if args.command == 'serve':
  s = Server('0.0.0.0', 5008, dev_mode=args.dev)
  s.wait()
elif args.command == 'init-collection':
  from .init_collection import run
  run()
elif args.command == 'init-morphs':
  from .init_morphs import run
  run()
elif args.command == 'init-known':
  from .init_known import run
  run()

