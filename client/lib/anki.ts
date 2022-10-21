import AnkiCardFormat from "@/interfaces/anki/ankiCardFormat";

const fetchAnki = async (endpoint: AnkiSettingType | string, isJson: boolean = true) => {
  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set("xc-auth", process.env.ANKI_HOST as string);
  const response = await fetch(`${process.env.ANKI_HOST}/api/${endpoint}`, {
    method: "GET",
    headers: requestHeaders,
  });
  if (!isJson) {
    return response;
  } else {
    try {
      const content = await response.json();
      return content;
    } catch (e) {
      console.warn(e);
    }
  }
};

const postAnki = async (endpoint: AnkiSettingType | string, body: any, method:string='POST') => {
  const response = await fetch(`${process.env.ANKI_HOST}/api/${endpoint}`, {
    method: method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  try {
    const content = await response.json();
    return content;
  } catch (e) {
    console.warn(e);
  }
};

const getDeckNames = async () => await fetchAnki(AnkiSettingType.Deck);
const getModelNames = async () => await fetchAnki(AnkiSettingType.Model);
const getModelFields = async (modelName: string) =>
  await fetchAnki(`fields/${modelName}`);

const getPrimaryDeck = async () => await fetchAnki(AnkiSettingType.PrimaryDeck);
const setPrimaryDeck = async (primaryDeck: string) =>
  await postAnki(AnkiSettingType.PrimaryDeck, {primary_deck: primaryDeck });

const getEnableSuspended = async () => await fetchAnki(AnkiSettingType.EnableSuspended);
  const setEnableSuspended = async (enableSuspended: boolean) =>
    await postAnki(AnkiSettingType.EnableSuspended, {enable_suspended: enableSuspended });

const getEnableWordAudioSearch= async () => await fetchAnki(AnkiSettingType.EnableWordAudioSearch);
    const setEnableWordAudioSearch = async (enableWordAudioSearch: boolean) =>
      await postAnki(AnkiSettingType.EnableWordAudioSearch, {enable_word_audio_search: enableWordAudioSearch });
      
const getCardFormats = async (): Promise<AnkiCardFormat[]> => {
  const data = await fetchAnki(AnkiSettingType.CardFormat);
  return data.map((cardFormat: any) => {
    const modelName: string = Object.keys(cardFormat)[0];
    return {
      modelName: modelName,
      modelMap: new Map(Object.entries(cardFormat[modelName])),
    };
  });
};

enum FieldValueType {
  Expression = "Expression",
  Reading = "Reading",
  Glossary = "Glossary",
  GlossaryBrief = "Glossary Brief",
  Audio = "Audio",
  Sentence = "Sentence",
  SentenceAudio = "Sentence Audio",
  SentenceTranslation = "Sentence Translation",
  Picture = "Picture",
  PitchAccent = "Pitch Accent",
  Frequencies = "Frequencies"
}

const fieldValueOptions = [
  "Expression",
  "Reading",
  "Glossary",
  "Glossary Brief",
  "Audio",
  "Sentence",
  "Sentence Audio",
  "Sentence Translation",
  "Picture",
  "Pitch Accent",
  "Frequencies",
];

enum AnkiSettingType {
  CardFormat = 'card_formats',
  Deck = "decks",
  Field = "fields",
  Model = "models",
  PrimaryDeck = "primary_deck",
  EnableSuspended = "enable_suspended",
  EnableWordAudioSearch = "enable_word_audio_search"
}

export {
  getDeckNames,
  getModelNames,
  getModelFields,
  getPrimaryDeck,
  getEnableSuspended,
  getEnableWordAudioSearch,
  getCardFormats,
  setPrimaryDeck,
  setEnableSuspended,
  setEnableWordAudioSearch,
  fieldValueOptions,
  AnkiSettingType,
  FieldValueType,
  fetchAnki,
  postAnki
};
