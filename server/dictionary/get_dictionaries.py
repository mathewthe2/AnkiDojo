from .dictionary_table import DictionaryTable, DictionaryActive

def get_dictionaries(con):
    cur = con.cursor()
    res = cur.execute("SELECT * FROM {Dictionary}".format(Dictionary=DictionaryTable.DICTIONARY.value))
    dictionaries = []
    for data in res.fetchall():
        dictionary_id, dictionary_name, enabled = data
        dictionaries.append({
            "id": dictionary_id,
            "name": dictionary_name,
            'enabled': enabled == DictionaryActive.ENABLED.value
        })
    return dictionaries