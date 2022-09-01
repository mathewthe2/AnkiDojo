export default interface AnkiNote {
    readonly noteId: number;
    readonly mediaDirectory: number,
    readonly tags: string[],
    readonly fields: Map<string, string>,
    readonly modelName: string,
    readonly cards: number[]
  }
  