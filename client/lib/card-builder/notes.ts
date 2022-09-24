import { NoteAddInterface } from "@/interfaces/card_builder/NoteAddInterface";

const ADD_NOTE_OPTIONS = {
  'allowDuplicate': true
}

export const addNotesToAnki = async (notesToAdd:NoteAddInterface[]) => {
    const body = {
        notes: notesToAdd.map(note=>{
            return {
                ...note,
                fields: Object.fromEntries(note.fields),
                options: ADD_NOTE_OPTIONS
            }
        })
    }
    const response = await fetch(`${process.env.ANKI_HOST}/api/notes`, {
      method: 'POST',
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    try {
      const content = await response.json();
      return content;
    } catch (e) {
      console.warn(e);
    }
  };
  