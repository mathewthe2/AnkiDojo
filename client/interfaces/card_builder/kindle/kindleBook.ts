export interface KindleVocab {
    baseForm: string;
    context: string;
    selection: string;
}

export default interface KindleBook {
    id: string;
    title: string;
    authors: string;
    language: string;
    asin: string;
    cover: string;
    count: number;
    lastLookup: number;
    vocabs: KindleVocab[];
}
  