export interface AddedNote {
  id: number;
  fields: Map<String, String>;
}

export interface SkippedNote {
  fields: Map<String, String>;
}

export default interface NoteResult {
  addedNotes: AddedNote[],
  skippedNotes: SkippedNote[],
}
