import { NoteMediaWithUrl } from "./NoteMedia";

// external expression term used for importing vocab with json files
// similar to NoteAddInterface but without deckName and modelName, and use media urls
export default interface RawNoteAddInterface {
  fields: Map<string, string>;
  options?: Map<string, string>;
  audio?: NoteMediaWithUrl[];
  video?: NoteMediaWithUrl[];
  picture?: NoteMediaWithUrl[];
  tags?: string[];
}
