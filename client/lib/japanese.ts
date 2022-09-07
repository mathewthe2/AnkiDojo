import { postAnki } from "./anki";

enum JapaneseType {
  Term = "terms",
}

export interface Definition {
  expression: string;
  glossary: string[];
  reading: string;
  rules: string[];
  source: string;
  tags: string[];
  pitch_svg: string[];
}

export const getTermDefinitions = async (
  keywords: string[]
): Promise<Definition[]> =>
  await postAnki(JapaneseType.Term, { keywords: keywords, include_pitch_graph: true  });
