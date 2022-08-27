const requestHeaders: HeadersInit = new Headers();
requestHeaders.set("xc-auth", process.env.ANKI_HOST as string);

const getDeckNames = async () => {
  const response = await fetch(`${process.env.ANKI_HOST}/api/decks`, {
    method: "GET",
    headers: requestHeaders,
  });
  const content = await response.json();
  return content;
};

const getModelNames = async () => {
  const response = await fetch(`${process.env.ANKI_HOST}/api/models`, {
    method: "GET",
    headers: requestHeaders,
  });
  const content = await response.json();
  return content;
};

const getModelFields = async (modelName: string) => {
  const response = await fetch(
    `${process.env.ANKI_HOST}/api/fields/${modelName}`,
    {
      method: "GET",
      headers: requestHeaders,
    }
  );
  const content = await response.json();
  return content;
};

const ANKI_FIELD_VALUES = [
  "Image",
  "Sentence",
  "Sentence-Audio",
  "Sentence-English",
  "Sentence-ID",
  "Sentence-Reading",
  "Vocabulary",
  "Vocabulary-Audio",
  "Vocabulary-English",
  "Vocabulary-Reading",
];

export { getDeckNames, getModelNames, getModelFields, ANKI_FIELD_VALUES };
