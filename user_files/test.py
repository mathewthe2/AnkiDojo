import json

model_maps = {
    "Japanese Morphman Audio Ankiweb": {
      "ID": "id",
      "Screenshot": "image",
      "Expression": "sentence",
      "Reading": "reading",
      "English": "translation",
      "Audio_Sentence": "audio"
  },
    "movies2anki - subs2srs": {
      "Id": "id",
      "Snapshot": "image",
      "Expression": "sentence",
      # "Reading": "reading",
      "Meaning": "translation",
      "Audio": "audio"
  },
      "subs2srs": {
      "SequenceMarker": "id",
      "Snapshot": "image",
      "Expression": "sentence",
      "Reading": "reading",
      "Meaning": "translation",
      "Audio": "audio"
  }
}

data = {
  "model_maps": model_maps
}

# with open('reader.json', 'w', encoding='utf-8') as f:
#     json.dump(data, f, ensure_ascii=False, indent=4)

with open('reader.json', 'r') as f:
    data = json.load(f)
print(data)

# filename = str(Path(bundle_dir, 'anki', ANKI_MODELS_FILENAME))
#   ankiModels = []
# with open('reader.yml', 'r') as stream:
#     try:
#         reader_settings = yaml.safe_load(stream)
#         print(reader_settings)
#     except yaml.YAMLError as exc:
#         print(exc)