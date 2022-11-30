from .dictionary_table import DictionaryTable, DictionaryActive

def _update_dictionary(con, id, column, value):
    cur = con.cursor()
    res = cur.execute("UPDATE {Dictionary} SET {column} = ? WHERE id = ?".format(
        Dictionary=DictionaryTable.DICTIONARY.value,
        column=column
    ), (value, id))
    con.commit()
    result = res.fetchall()
    return result

def update_enabled(con, id, enabled):
    enabled_value = DictionaryActive.ENABLED.value if enabled else DictionaryActive.DISABLED.value 
    return _update_dictionary(con=con, id=id, column="enabled", value=enabled_value)