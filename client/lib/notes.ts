const getLocalNotesByDeck = async (deckName: String, offset: Number) => {
    const requestHeaders: HeadersInit = new Headers();
    requestHeaders.set("xc-auth", process.env.ANKI_HOST as string);
    const response = await fetch(`${process.env.ANKI_HOST}/api/reader/${deckName}?offset=${offset}`, {
      method: "GET",
      headers: requestHeaders
    });
    const content = await response.json();
    return content;
  };

const getOnlineNotesByDeck = async (deckName: String, category: String, offset: Number) => {
    const requestHeaders: HeadersInit = new Headers();
    requestHeaders.set("xc-auth", process.env.HOST as string);
    const response = await fetch(`${process.env.HOST}/read?id=${deckName}&category=${category}&offset=${offset}`, {
    method: "GET",
    headers: requestHeaders,
  });
  const content = await response.json();
  return content;
};

export { getLocalNotesByDeck, getOnlineNotesByDeck }

