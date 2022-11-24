import sqlite3

# setup new dictionary db with database connection
def setup_dictionary(con):
    cur = con.cursor()
    cur.executescript("""
        BEGIN;
        CREATE TABLE Dictionary (id INTEGER PRIMARY KEY, title TEXT, enabled INTEGER);
        CREATE TABLE Kanji(id INTEGER PRIMARY KEY, dictionaryId INTEGER, character TEXT, kunyomi TEXT, onyomi TEXT);
        CREATE TABLE KanjiGloss(glossary TEXT, kanjiId INTEGER, dictionaryId INTEGER, FOREIGN KEY(kanjiId) REFERENCES Kanji(id));
        CREATE TABLE Vocab(id INTEGER PRIMARY KEY, dictionaryId INTEGER, expression TEXT, reading TEXT, sequence INTEGER, popularity REAL,  meaningTags TEXT, termTags TEXT);
        CREATE TABLE VocabGloss(glossary TEXT, vocabId INTEGER, dictionaryId INTEGER, FOREIGN KEY(vocabId) REFERENCES Vocab(id));
        CREATE TABLE VocabFreq(expression TEXT, reading TEXT, frequency TEXT, dictionaryId INTEGER);
        CREATE TABLE VocabPitch(expression TEXT, reading TEXT, pitch TEXT, dictionaryId INTEGER);

        CREATE INDEX index_VocabGloss_vocabId ON VocabGloss(vocabId);
        CREATE INDEX index_Vocab_expression ON Vocab(expression);
        CREATE INDEX index_Vocab_reading ON Vocab(reading);
        CREATE INDEX index_VocabFreq_expression ON VocabFreq(expression);
        CREATE INDEX index_VocabFreq_reading ON VocabFreq(reading);
        CREATE INDEX index_VocabPitch_expression ON VocabPitch(expression ASC);
        CREATE INDEX index_VocabPitch_reading ON VocabPitch(reading ASC);
        COMMIT;
    """)