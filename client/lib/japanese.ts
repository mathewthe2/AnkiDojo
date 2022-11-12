import { postAnki } from "./anki";

enum JapaneseType {
  Term = "terms",
}

export interface AudioUrl {
  name: string;
  url: string;
}

export interface Definition {
  expression?: string;
  glossary?: string[]; // possible glossary entries
  selectedGlossary?: string; // user selected glossary
  surface?: string; // user expression / base form
  reading?: string;
  rules?: string[];
  source?: string;
  tags?: string[];
  pitch_svg?: string[];
  audio_urls?: AudioUrl[]; // possible audio urls
  selectedAudioUrl?: string; // user selected audio url
  sentences?: string[];
  sentence_translations?: string[];
  morph_state?: string; // known or not known
}

const parseForAnki = (content: String) => {
  return content.replace(/(?:\r\n|\r|\n)/g, '<br>');
}

export const getExpressionForAnki = (definition: Definition | undefined)=> {
  const expression =  definition?.expression ||definition?.surface ||'';
  return parseForAnki(expression);
}

export const getGlossaryForAnki = (definition: Definition | undefined)=> {
  const glossary =  definition?.selectedGlossary || definition?.glossary?.[0] ||'';
  return parseForAnki(glossary);
}

export const getGlossaryBriefForAnki = (definition: Definition | undefined)=> {
  return getGlossaryForAnki(definition); // TODO: get glossary brief
}

export const getSentenceForAnki = (definition: Definition | undefined)=> {
  const sentence = definition?.sentences?.[0] || '';
  return parseForAnki(sentence);
}

export const getSentenceTranslationForAnki = (definition: Definition | undefined)=> {
  const sentenceTranslation = definition?.sentence_translations?.[0] || ""
  return parseForAnki(sentenceTranslation);
}


export const getTermDefinitions = async ({
  keywords,
  passages,
  include_audio_urls,
}: {
  keywords: string[];
  passages?: string[];
  include_audio_urls?: boolean;
}): Promise<Definition[]> =>
  await postAnki(JapaneseType.Term, {
    passages: passages || [],
    keywords: keywords,
    include_pitch_graph: true,
    include_audio_urls: include_audio_urls,
  });
