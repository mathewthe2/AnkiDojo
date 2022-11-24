import os
import sqlite3
from .add_dictionary import add_dictionary_from_archive
from .setup_dictionary import setup_dictionary

# Paths
user_files_directory = os.path.join(os.path.dirname(__file__), '..', '..', 'user_files')
dictionary_database_path = os.path.join(user_files_directory, "dictionaries.db")

class Dictionary():
    def __init__(self):
        if not os.path.exists(dictionary_database_path):
            self._setup_dictionary()
        else:
            self.con = sqlite3.connect(dictionary_database_path)

    def add_dictionary(self, archive):
        if self.con is None:
            return None
        dictionary_name = add_dictionary_from_archive(archive, self.con)
        return dictionary_name

    def _setup_dictionary(self):
        self.con = sqlite3.connect(dictionary_database_path)
        setup_dictionary(self.con)
        