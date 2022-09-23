import { postAnki } from "./anki";

enum JapaneseType {
  Term = "terms",
}

export interface Definition {
  expression?: string;
  glossary?: string[]; // possible glossary entries
  selectedGlossary?: string; // user selected glossary
  reading?: string;
  rules?: string[];
  source?: string;
  tags?: string[];
  pitch_svg?: string[];
  sentence?: string;
}

export const getTermDefinitions = async (
  keywords: string[]
): Promise<Definition[]> =>
  await postAnki(JapaneseType.Term, { keywords: keywords, include_pitch_graph: true  });
