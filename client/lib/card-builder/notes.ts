import { fetchAnki } from "../anki";
import { NoteAddInterface } from "@/interfaces/card_builder/NoteAddInterface";

const ADD_NOTE_OPTIONS = {
  allowDuplicate: true,
};

export const hasMecabSupport = async () => {
  const result = await fetchAnki("mecab_support");
  if (result["has_mecab"]) {
    return result["has_mecab"];
  } else {
    return false;
  }
};

export const addNotesToAnki = async (notesToAdd: NoteAddInterface[]) => {
  const body = {
    notes: notesToAdd.map((note) => {
      return {
        ...note,
        fields: Object.fromEntries(note.fields),
        options: ADD_NOTE_OPTIONS,
      };
    }),
  };
  const response = await fetch(`${process.env.ANKI_HOST}/api/notes`, {
    method: "POST",
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
