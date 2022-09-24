interface NoteMediaMeta {
  filename: string;
  skipHash?: string;
  fields: string[];
}

interface NoteMediaWithUrl extends NoteMediaMeta {
  url: string;
}

interface NoteMediaWithData extends NoteMediaMeta {
  data: string; // base64
}

export type NoteMedia = NoteMediaWithUrl | NoteMediaWithData;
