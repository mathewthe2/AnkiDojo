import { NoteMedia } from "./NoteMedia"

export interface NoteAddInterface {
    deckName: string,
    modelName: string,
    fields: Map<string, string>,
    audio?: NoteMedia[],
    video?: NoteMedia[],
    picture?: NoteMedia[],
    tags: string[]
}
