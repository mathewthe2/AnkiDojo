import { fetchAnki } from "../anki";
import AnkiNote from "@/interfaces/anki/ankiNote";

const getNotes = async(keyword: string) => {
  const noteData = await fetchAnki(`${SearchType.Note}?keyword=${keyword}`)
  const data:AnkiNote[] = noteData.data.map((note:any) => {
    return {
      ...note,
      fields: new Map(Object.entries(note['fields'])),
    }
  })
  return {
    ...noteData,
    data
  }
};

enum SearchType {
  Note = "notes",
}

export { getNotes, SearchType };
