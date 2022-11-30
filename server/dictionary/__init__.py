import os
import sqlite3
from .add_dictionary import add_dictionary_from_archive
from .setup_dictionary import setup_dictionary
from .get_dictionaries import get_dictionaries
from .update_dictionary import update_enabled
from .delete_dictionary import delete_dictionary

# Paths
user_files_directory = os.path.join(os.path.dirname(__file__), '..', '..', 'user_files')
dictionary_database_path = os.path.join(user_files_directory, "dictionaries.db")

class Dictionary():
    def __init__(self):
        if not os.path.exists(dictionary_database_path):
            self._setup_dictionary()
        else:
            self.con = sqlite3.connect(dictionary_database_path)

    def get_dictionaries(self):
        if self.con is None:
            return []
        return get_dictionaries(self.con)

    def add_dictionary(self, archive):
        if self.con is None:
            return None
        dictionary_name = add_dictionary_from_archive(archive, self.con)
        return dictionary_name

    def set_enabled(self, id, enabled):
        if self.con is None:
            return None
        return update_enabled(con=self.con, id=id, enabled=enabled)

    def remove_dictionary(self, id):
        if self.con is None:
            return None
        return delete_dictionary(self.con, id)
        
    def _setup_dictionary(self):
        self.con = sqlite3.connect(dictionary_database_path)
        setup_dictionary(self.con)
        