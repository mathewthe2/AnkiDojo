class DictionaryEntry:
    # meanings = []
    
    def __init__(self, id, dictionary_id, term, reading, sequence, popularity, meaning_tags, term_tags):
        self.id = id
        self.dictionary_id = dictionary_id
        self.term = term
        self.reading = reading
        self.sequence = sequence
        self.popularity = popularity
        self.meaning_tags = meaning_tags
        self.term_tags = term_tags