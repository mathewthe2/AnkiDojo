import AnkiCardFormat from "@/interfaces/anki/ankiCardFormat";

export enum ProcessingStatusType {
  Progress = 'progress',
  Complete = 'complete'
}

export interface ProcessingDataInterface {
  status: ProcessingStatusType;
  data: any;
  location: string;
}

const fetchAnki = async (
  endpoint: AnkiSettingType | string,
  isJson: boolean = true
) => {
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

const postAnki = async (
  endpoint: AnkiSettingType | string,
  body: any,
  method: string = "POST"
) => {
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

const postAnkiMultiBody = async (
  endpoint: AnkiSettingType | string,
  formData: FormData,
  method: string = "POST"
) => {
  const response = await fetch(`${process.env.ANKI_HOST}/api/${endpoint}`, {
    method: method,
    body: formData,
  });
  try {
    const content = await response.json();
    return content;
  } catch (e) {
    console.warn(e);
  }
};

const getAnkiSettings = async (endpoint: AnkiSettingType) =>
  await fetchAnki(`anki_settings/${endpoint}`);
const postAnkiSettings = async (endpoint: AnkiSettingType, value: any) =>
  await postAnki(`anki_settings/${endpoint}`, { value: value });

const getDeckNames = async () => await fetchAnki(AnkiSettingType.Deck);
const getModelNames = async () => await fetchAnki(AnkiSettingType.Model);
const getModelFields = async (modelName: string) =>
  await fetchAnki(`fields/${modelName}`);

const getPrimaryDeck = async () =>
  await getAnkiSettings(AnkiSettingType.PrimaryDeck);
const setPrimaryDeck = async (primaryDeck: string) =>
  await postAnkiSettings(AnkiSettingType.PrimaryDeck, primaryDeck);

const getEnableSuspended = async () =>
  await getAnkiSettings(AnkiSettingType.EnableSuspended);

const setEnableSuspended = async (enableSuspended: boolean) =>
  await postAnkiSettings(AnkiSettingType.EnableSuspended, enableSuspended);

const getEnableWordAudioSearch = async () =>
  await getAnkiSettings(AnkiSettingType.EnableWordAudioSearch);

const setEnableWordAudioSearch = async (enableWordAudioSearch: boolean) =>
  await postAnkiSettings(
    AnkiSettingType.EnableWordAudioSearch,
    enableWordAudioSearch
  );

const getAllowDuplicate = async () =>
  await getAnkiSettings(AnkiSettingType.AllowDuplicate);

const setAllowDuplicate = async (allowDuplicate: boolean) =>
  await postAnkiSettings(
    AnkiSettingType.AllowDuplicate,
    allowDuplicate
  );

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
  Frequencies = "Frequencies",
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
  CardFormat = "card_formats",
  Deck = "decks",
  Field = "fields",
  Model = "models",
  PrimaryDeck = "primary_deck",
  EnableSuspended = "enable_suspended",
  EnableWordAudioSearch = "enable_word_audio_search",
  AllowDuplicate = "allow_duplicate",
}

export {
  getDeckNames,
  getModelNames,
  getModelFields,
  getPrimaryDeck,
  getEnableSuspended,
  getEnableWordAudioSearch,
  getAllowDuplicate,
  getCardFormats,
  setPrimaryDeck,
  setEnableSuspended,
  setEnableWordAudioSearch,
  setAllowDuplicate,
  fieldValueOptions,
  AnkiSettingType,
  FieldValueType,
  fetchAnki,
  postAnki,
  postAnkiMultiBody,
};
