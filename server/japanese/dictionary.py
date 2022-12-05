# -*- coding: utf-8 -*-

# Copyright (C) 2013  Alex Yatskov
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.


import operator
import sqlite3

from .dictionary_entry import DictionaryEntry

TERM_LIMIT = 1000


class Dictionary:
    def __init__(self, filename, index=True):
        self.db = sqlite3.connect(filename)
        # self.indices = set()


    def findTerm(self, text, wildcards=False, reading=None):
        # self.requireIndex('Vocab', 'expression')
        # self.requireIndex('Vocab', 'reading')
        # self.requireIndex('VocabGloss', 'vocabId')

        cursor = self.db.cursor()

        definitions = []
        if reading:
            cursor.execute('SELECT * FROM Vocab WHERE expression {0} ? AND reading=? LIMIT {1}'.format('LIKE' if wildcards else '=', TERM_LIMIT), (text, reading))
        else:
            cursor.execute('SELECT * FROM Vocab WHERE expression {0} ? OR reading=? LIMIT {1}'.format('LIKE' if wildcards else '=', TERM_LIMIT), (text, text))    
        for vocabulary_item in cursor.fetchall():
            entry = DictionaryEntry(*vocabulary_item)
            tags = entry.term_tags.split()

            cursor.execute('SELECT glossary From VocabGloss WHERE vocabId=?', (entry.id,))
            glossary = [g[0] for g in cursor.fetchall()]

            #
            # TODO: Handle addons through data.
            #

            addons = []
            for tag in tags:
                if tag.startswith('v5') and tag != 'v5':
                    addons.append('v5')
                elif tag.startswith('vs-'):
                    addons.append('vs')

            definitions.append({
                'id':         entry.id,
                'expression': entry.term,
                'reading':    entry.reading,
                'glossary':   glossary,
                'tags':       tags + addons,
                'popularity': entry.popularity,
                'addons':     addons
            })

        return definitions


    def findKanji(self, text):
        assert len(text) == 1

        # self.requireIndex('Kanji', 'character')
        # self.requireIndex('KanjiGloss', 'kanjiId')

        # cursor = self.db.cursor()

        # cursor.execute('SELECT * FROM Kanji WHERE character=? LIMIT 1', text)
        # query = cursor.fetchone()
        # if query is None:
        #     return

        # kanjiId, character, kunyomi, onyomi = query
        # cursor.execute('SELECT glossary From KanjiGloss WHERE kanjiId=?', (kanjiId,))
        # glossary = map(operator.itemgetter(0), cursor)

        # return {
        #     'id':        kanjiId,
        #     'character': character,
        #     'kunyomi':   [] if kunyomi is None else kunyomi.split(),
        #     'onyomi':    [] if onyomi is None else onyomi.split(),
        #     'glossary':  glossary
        # }


    # def requireIndex(self, table, column):
    #     name = 'index_{0}_{1}'.format(table, column)
    #     if not self.hasIndex(name):
    #         self.buildIndex(name, table, column)


    # def buildIndex(self, name, table, column):
    #     cursor = self.db.cursor()
    #     cursor.execute('CREATE INDEX {0} ON {1}({2})'.format(name, table, column))
    #     self.db.commit()


    # def hasIndex(self, name):
    #     if name in self.indices:
    #         return True

    #     cursor = self.db.cursor()
    #     cursor.execute('SELECT * FROM sqlite_master WHERE name=?', (name,))
    #     if len(cursor.fetchall()) == 0:
    #         return False

    #     self.indices.update([name])
    #     return True
