import re
import sqlite3
from .draw_pitch import pitch_value_to_patt, pitch_svg

class Pitch():
    def __init__(self, db_path):
        self.db = sqlite3.connect(db_path)

    def get_pitch(self, expression, reading=''):
        cursor = self.db.cursor()
        if reading:
            cursor.execute("SELECT pitch FROM Dict WHERE expression=?", (expression,))
        else:
            cursor.execute("SELECT pitch FROM Dict WHERE expression=? AND reading=?", (expression, reading))
        result = cursor.fetchone()
        return None if result is None else result[0]

    def get_svg(self, expression, reading=''):
        result = []
        pitch = self.get_pitch(expression, reading)
        if not pitch:
            return []
        pitch = re.sub(r"\((.*?)\)", "", pitch) # remove paranthesis content
        pitches = []
        if ',' in pitch:
            pitches_by_word = pitch.split(',')
            for pitch_by_word in pitches_by_word:
                pitch_by_word = re.sub(r'[^\w]', '', pitch_by_word) # remove symbols 
                pitches.append(pitch_by_word)
        else:
            pitch = re.sub(r'[^\w]', '', pitch) # remove symbols 
            pitches = [pitch]
        
        parsed_pitches = set()
        for raw_pitch in pitches:
            if raw_pitch.isnumeric():
                for c in [*raw_pitch]:
                    parsed_pitches.add(int(c))

        print(parsed_pitches)
        for pitch_value in parsed_pitches:
            svg = pitch_svg(reading, pitch_value_to_patt(reading, pitch_value))
            result.append(svg)
        return result

# if __name__ == '__main__':
#     import os
#     directory = os.path.join(os.path.dirname(__file__), 'pitch_accents.sqlite')
#     p = Pitch(directory)
#     a = p.get_svg('お手前', 'おてまえ')
#     b = p.get_svg('この方', 'このかた')
#     c = p.get_svg('虹色', 'にじいろ')
#     print(a)