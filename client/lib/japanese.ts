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
  morph_state?: string; // known or not known
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
    include_audio_urls: include_audio_urls || true,
  });
