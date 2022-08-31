import AnkiCardFormat from "@/interfaces/anki/ankiCardFormat";

const fetchAnki = async (endpoint: string, isJson: boolean = true) => {
  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set("xc-auth", process.env.ANKI_HOST as string);
  const response = await fetch(`${process.env.ANKI_HOST}/${endpoint}`, {
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

const postAnki = async (endpoint: string, body: any) => {
  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set("xc-auth", process.env.ANKI_HOST as string);
  const response = await fetch(`${process.env.ANKI_HOST}/${endpoint}`, {
    method: "POST",
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

const getDeckNames = async () => await fetchAnki("api/decks");
const getModelNames = async () => await fetchAnki("api/models");
const getModelFields = async (modelName: string) =>
  await fetchAnki(`/api/fields/${modelName}`);

const getPrimaryDeck = async () => await fetchAnki("api/primary_deck");
const setPrimaryDeck = async (primaryDeck: string) =>
  await postAnki("api/primary_deck", { primary_deck: primaryDeck });

const getCardFormats = async (): Promise<AnkiCardFormat[]> => {
  const data = await fetchAnki("api/card_formats");
  return data.map((cardFormat: any) => {
    const model: string = Object.keys(cardFormat)[0];
    return {
      model: model,
      modelMap: new Map(Object.entries(cardFormat[model])),
    };
  });
};

const addOrModifyCardFormat = async (cardFormat: AnkiCardFormat) =>
  await postAnki("api/card_formats", {
    model: cardFormat.model,
    model_map: Object.fromEntries(cardFormat.modelMap),
  });

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

export {
  getDeckNames,
  getModelNames,
  getModelFields,
  getPrimaryDeck,
  getCardFormats,
  setPrimaryDeck,
  addOrModifyCardFormat,
  fieldValueOptions,
};
