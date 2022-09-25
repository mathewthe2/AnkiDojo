import re
import sqlite3
from .draw_pitch import pitch_value_to_patt, pitch_svg

class Pitch():
    def __init__(self, db_path):
        self.db = sqlite3.connect(db_path, check_same_thread=False)

    def get_pitch(self, expression, reading=''):
        cursor = self.db.cursor()
        if not reading:
            cursor.execute("SELECT pitch FROM Dict WHERE expression=?", (expression,))
        else:
            cursor.execute("SELECT pitch FROM Dict WHERE expression=? AND reading=?", (expression, reading))
        result = cursor.fetchone()
        return None if result is None else result[0]

    def get_svg(self, expression, reading=''):
        result = []
        if not expression:
            return []
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

if __name__ == '__main__':
    import os
    from concurrent.futures import as_completed
    from concurrent.futures.thread import ThreadPoolExecutor

    directory = os.path.join(os.path.dirname(__file__), 'pitch_accents.sqlite')
    p = Pitch(directory)
    data = [
        {
            'expression': 'お手前',
            'reading': 'おてまえ',
        },
         {
            'expression': 'この方',
            'reading': 'このかた',
        },
          {
            'expression': '虹色',
            'reading': 'にじいろ',
        }
    ]

    with ThreadPoolExecutor(max_workers=5) as executor:
        future_to_pitch_graph= {executor.submit(p.get_svg, word['expression'], word['reading']): word for word in data}
        for index, future in enumerate(as_completed(future_to_pitch_graph)):
            pitch_graph = future_to_pitch_graph[future]
            try:
                pitch_graph_result = future.result()
            except Exception as exc:
                print('%r generated an exception: %s' % (pitch_graph, exc))
            else:
                print(pitch_graph_result)