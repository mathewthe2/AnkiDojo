import zipfile
import sqlite3
import json
from .dictionary_table import DictionaryTable, DictionaryActive

# save new dictionary db with database connection
def add_dictionary_from_archive(archive, con):
    cur = con.cursor()
    term_data = list()
    meta_data = list()
    dictionary_name = ''

    for file in archive.namelist():
        if file.startswith('term_bank'):
            with archive.open(file) as f:
                data = f.read()  
                d = json.loads(data.decode("utf-8"))
                term_data.extend(d)
        elif file.startswith('term_meta_bank'):
            with archive.open(file) as f:
                data = f.read()  
                d = json.loads(data.decode("utf-8"))
                meta_data.extend(d)
        elif file == 'index.json':
            with archive.open(file) as f:
                data = f.read()
                d = json.loads(data.decode("utf-8"))
                if "title" in d:
                    dictionary_name = d["title"]

    dictionary_entries = []
    for raw_term in term_data:
        dictionary_entries.append({
            "term": raw_term[0],
            "reading": raw_term[1],
            "meanings": raw_term[5],
            "popularity": raw_term[4],
            "meaning_tags": raw_term[2],
            "term_tags": raw_term[7],
            "sequence": raw_term[6]
        })

    def getLastRecordId(table):
        if (table not in DictionaryTable):
            return 0
        res = cur.execute("SELECT id FROM {} ORDER BY id DESC LIMIT 1;".format(table.value))
        id = res.fetchone()
        if id:
            return id
        return 0

    lastRecordId = getLastRecordId(DictionaryTable.VOCAB)
    dictionaryId = 1 + getLastRecordId(DictionaryTable.DICTIONARY)
    dictionary_entry_values = []
    dictionary_meaning_values = []
    for entry in dictionary_entries:
        lastRecordId += 1
        dictionary_entry_values.append((
            lastRecordId, 
            dictionaryId, 
            entry["term"], 
            entry["reading"], 
            entry["meaning_tags"], 
            entry["term_tags"],
            entry["popularity"],
            entry["sequence"]
        ))
        for meaning in entry["meanings"]:
            dictionary_meaning_values.append((
                meaning,
                lastRecordId,
                dictionaryId
            ))
    cur.executemany("""
        INSERT INTO {}(id, dictionaryId, expression, reading, meaningTags, termTags, popularity, sequence) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """.format(DictionaryTable.VOCAB.value), dictionary_entry_values)
    cur.executemany('INSERT INTO {}(glossary, vocabId, dictionaryId) VALUES(?, ?, ?)'.format(DictionaryTable.VOCAB_GLOSS.value), dictionary_meaning_values)
    cur.execute('INSERT INTO {}(title, enabled) VALUES(?, ?)'.format(DictionaryTable.DICTIONARY.value), (dictionary_name, DictionaryActive.ENABLED.value)) 
    # dictionary_id = cur.lastrowid
    con.commit()
    return dictionary_name