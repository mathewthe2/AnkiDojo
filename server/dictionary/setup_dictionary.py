import sqlite3
from .dictionary_table import DictionaryTable

# setup new dictionary db with database connection
def setup_dictionary(con):
    cur = con.cursor()
    cur.executescript("""
        BEGIN;
        CREATE TABLE {Dictionary} (id INTEGER PRIMARY KEY, title TEXT, enabled INTEGER);
        CREATE TABLE {Kanji}(id INTEGER PRIMARY KEY, dictionaryId INTEGER, character TEXT, kunyomi TEXT, onyomi TEXT);
        CREATE TABLE {KanjiGloss}(glossary TEXT, kanjiId INTEGER, dictionaryId INTEGER, FOREIGN KEY(kanjiId) REFERENCES Kanji(id));
        CREATE TABLE {Vocab}(id INTEGER PRIMARY KEY, dictionaryId INTEGER, expression TEXT, reading TEXT, sequence INTEGER, popularity REAL,  meaningTags TEXT, termTags TEXT);
        CREATE TABLE {VocabGloss}(glossary TEXT, vocabId INTEGER, dictionaryId INTEGER, FOREIGN KEY(vocabId) REFERENCES {Vocab}(id));
        CREATE TABLE {VocabFreq}(expression TEXT, reading TEXT, frequency TEXT, dictionaryId INTEGER);
        CREATE TABLE {VocabPitch}(expression TEXT, reading TEXT, pitch TEXT, dictionaryId INTEGER);

        CREATE INDEX index_{VocabGloss}_vocabId ON {VocabGloss}(vocabId);
        CREATE INDEX index_{Vocab}_expression ON {Vocab}(expression);
        CREATE INDEX index_{Vocab}_reading ON {Vocab}(reading);
        CREATE INDEX index_{VocabFreq}_expression ON {VocabFreq}(expression);
        CREATE INDEX index_{VocabFreq}_reading ON {VocabFreq}(reading);
        CREATE INDEX index_{VocabPitch}_expression ON {VocabPitch}(expression ASC);
        CREATE INDEX index_{VocabPitch}_reading ON {VocabPitch}(reading ASC);
        COMMIT;
    """.format(
        Dictionary=DictionaryTable.DICTIONARY.value,
        Kanji=DictionaryTable.KANJI.value,
        KanjiGloss=DictionaryTable.KANJI_GLOSS.value,
        Vocab=DictionaryTable.VOCAB.value,
        VocabGloss=DictionaryTable.VOCAB_GLOSS.value,
        VocabFreq=DictionaryTable.VOCAB_FREQ.value,
        VocabPitch=DictionaryTable.VOCAB_PITCH.value,
    ))