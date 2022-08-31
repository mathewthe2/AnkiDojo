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

const getDeckNames = async () => await fetchAnki("api/decks");
const getModelNames = async () => await fetchAnki("api/models");
const getModelFields = async (modelName: string) =>
  await fetchAnki(`/api/fields/${modelName}`);

const getPrimaryDeck = async () => await fetchAnki("api/primary_deck");

const getCardFormats = async (): Promise<AnkiCardFormat[]> => {
  const data = await fetchAnki("api/card_formats");
  return data.map((cardFormat: any) => {
    return {
      model: Object.keys(cardFormat)[0],
      modelMap: cardFormat[Object.keys(cardFormat)[0]],
    };
  });
};

const addOrModifyCardFormat = async (cardFormat: AnkiCardFormat) => {
  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set("xc-auth", process.env.ANKI_HOST as string);
  const rawResponse = await fetch(`${process.env.ANKI_HOST}/api/card_formats`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: cardFormat.model,
      model_map: Object.fromEntries(cardFormat.modelMap),
    }),
  });
  const content = await rawResponse.json();
  console.log(content);
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

export {
  getDeckNames,
  getModelNames,
  getModelFields,
  getPrimaryDeck,
  getCardFormats,
  addOrModifyCardFormat,
  fieldValueOptions,
};
