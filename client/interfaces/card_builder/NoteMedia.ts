interface NoteMediaMeta {
  filename: string;
  skipHash?: string;
  fields: string[];
}

export interface NoteMediaWithUrl extends NoteMediaMeta {
  url: string;
}

export interface NoteMediaWithData extends NoteMediaMeta {
  data: string; // base64
}

export type NoteMedia = NoteMediaWithUrl | NoteMediaWithData;
