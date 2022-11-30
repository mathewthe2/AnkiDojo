from .dictionary_table import DictionaryTable

def delete_dictionary(con, id):
    cur = con.cursor()
    res = cur.executescript("""
         BEGIN;
        DELETE FROM {Dictionary} WHERE id = {id};
        DELETE FROM {Kanji} WHERE dictionaryId = {id};
        DELETE FROM {KanjiGloss} WHERE dictionaryId = {id};
        DELETE FROM {Vocab} WHERE dictionaryId = {id};
        DELETE FROM {VocabGloss} WHERE dictionaryId = {id};
        DELETE FROM {VocabFreq} WHERE dictionaryId = {id};
        DELETE FROM {VocabPitch} WHERE dictionaryId = {id};
        COMMIT;
    """.format(
        id=id,
        Dictionary=DictionaryTable.DICTIONARY.value,
        Kanji=DictionaryTable.KANJI.value,
        KanjiGloss=DictionaryTable.KANJI_GLOSS.value,
        Vocab=DictionaryTable.VOCAB.value,
        VocabGloss=DictionaryTable.VOCAB_GLOSS.value,
        VocabFreq=DictionaryTable.VOCAB_FREQ.value,
        VocabPitch=DictionaryTable.VOCAB_PITCH.value,
    ))
    result = res.fetchall()
    return result

