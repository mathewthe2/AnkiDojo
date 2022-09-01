import os
import json

# Paths
user_files_directory = os.path.join(os.path.dirname(__file__), '..', 'user_files')

class Settings():
    def __init__(self):
        self.anki_settings = self._read_from_file()

    def _read_from_file(self):
        with open(os.path.join(user_files_directory, 'ankiSettings.json'), 'r', encoding='utf-8') as f:
            return json.load(f)

    def _write_to_file(self):
        with open(os.path.join(user_files_directory, 'ankiSettings.json'), 'w+', encoding='utf-8') as outfile:
            json.dump(self.anki_settings, outfile, indent=4, ensure_ascii=False)

    def get_models(self):
        return list(self.anki_settings['model_maps'])

    def update_anki_settings(self, update_dict):
        for key, value in update_dict.items():
            self.anki_settings[key] = value

        self._write_to_file()
        return update_dict

    def update_anki_model_map(self, model_name, model_map):
        if 'model_maps' in self.anki_settings:
            if model_map:
                self.anki_settings['model_maps'][model_name] = model_map
            elif model_name in self.anki_settings['model_maps']:
                del self.anki_settings['model_maps'][model_name] 
        else:
            if model_map:
                self.anki_settings['model_maps'] = [model_map]

        self._write_to_file()
        return model_name

# s = Settings()
# models = s.get_models()
# models = []
# s = ' OR '.join(['"note:{}"'.format(model) for model in models])
# print(s)