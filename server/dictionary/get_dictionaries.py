from .dictionary_table import DictionaryTable

def get_dictionaries(con):
    cur = con.cursor()
    res = cur.execute("SELECT * FROM {Dictionary}".format(Dictionary=DictionaryTable.DICTIONARY.value))
    dictionaries = []
    for data in res.fetchall():
        dictionary_id, dictionary_name, _ = data
        dictionaries.append({
            "dictionary_id": dictionary_id,
            "dictionary_name": dictionary_name
        })
    return dictionaries