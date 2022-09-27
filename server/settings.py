import os
import json

# Paths
user_files_directory = os.path.join(os.path.dirname(__file__), '..', 'user_files')
    
class Settings():
    def __init__(self, filename):
        self.settings_file = os.path.join(user_files_directory, filename) 
        self.settings_data = self._read_from_file()

    def _read_from_file(self):
        with open(self.settings_file, 'r', encoding='utf-8') as f:
            return json.load(f)

    def _write_to_file(self):
        with open(self.settings_file, 'w+', encoding='utf-8') as outfile:
            json.dump(self.settings_data, outfile, indent=4, ensure_ascii=False)

    def update_settings_data(self, update_dict):
        for key, value in update_dict.items():
            self.settings_data[key] = value

        self._write_to_file()
        return update_dict


class AnkiSettings(Settings):
    def __init__(self, filename='ankiSettings.json'):
        super().__init__(filename)

    def get_models(self):
        if 'model_maps' in self.settings_data:
            return list(self.settings_data['model_maps'])
        else:
            return []

    def update_anki_model_map(self, model_name, model_map):
        if 'model_maps' in self.settings_data:
            if model_map:
                self.settings_data['model_maps'][model_name] = model_map
            elif model_name in self.settings_data['model_maps']:
                del self.settings_data['model_maps'][model_name] 
        else:
            if model_map:
                self.settings_data['model_maps'] = [model_map]

        self._write_to_file()
        return model_name

class MorphSettings(Settings):
    def __init__(self, filename='morphStates.json'):
        super().__init__(filename)

    def get_known_morphs(self):
        if 'MORPH_STATE_KNOWN' in self.settings_data:
            return self.settings_data['MORPH_STATE_KNOWN']
        else:
            return []

    def add_known_morphs(self, morphs):
        known_morphs = self.get_known_morphs()
        combined = list(set(known_morphs + morphs))
        super().update_settings_data({'MORPH_STATE_KNOWN': combined})
        return combined
        