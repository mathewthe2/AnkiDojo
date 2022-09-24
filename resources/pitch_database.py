import os
import sqlite3

con = sqlite3.connect(os.path.join(os.path.dirname(__file__), 'pitch_accents.sqlite'))
cur = con.cursor()

cur.execute("DROP TABLE IF EXISTS Dict")
cur.execute("CREATE TABLE Dict(expression TEXT, reading TEXT, pitch TEXT)")
cur.execute("CREATE INDEX ix_expression ON dict(expression ASC)")
cur.execute("CREATE INDEX ix_reading ON dict(reading ASC)")

data = []
with open(os.path.join(os.path.dirname(__file__), 'accents.txt'), encoding="utf8") as f:
    accents = f.readlines()
    data = [accent.split('\t') for accent in accents]

cur.executemany('INSERT INTO Dict VALUES(?, ?, ?)', data)
con.commit()
con.close()


