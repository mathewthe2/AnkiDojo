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

const getCardFormats = async (): Promise<AnkiCardFormat[]> => {
  const data = await fetchAnki(AnkiSettingType.CardFormat);
  return data.map((cardFormat: any) => {
    const model: string = Object.keys(cardFormat)[0];
    return {
      model: model,
      modelMap: new Map(Object.entries(cardFormat[model])),
    };
  });
};

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
  PrimaryDeck = "primary_deck"
}

export {
  getDeckNames,
  getModelNames,
  getModelFields,
  getPrimaryDeck,
  getCardFormats,
  setPrimaryDeck,
  fieldValueOptions,
  AnkiSettingType,
  postAnki
};
