import { useEffect, useState } from "react";
import { Text, Select } from "@mantine/core";
import { getDeckNames, getPrimaryDeck, setPrimaryDeck } from "@/lib/anki";

function AnkiPrimaryDeck() {
  const [deckNames, setDeckNames] = useState([]);
  const [inputPrimaryDeck, setInputPrimaryDeck] = useState<string | null>(null);
  useEffect(() => {
    getDeckNames().then((deckNames) => setDeckNames(deckNames.sort()));
    getPrimaryDeck().then((primaryDeck) => setInputPrimaryDeck(primaryDeck));
  }, []);

  const updatePrimaryDeck = (primaryDeck: string) => {
    setInputPrimaryDeck(primaryDeck);
    setPrimaryDeck(primaryDeck);
  }
  return (
    <>
      {inputPrimaryDeck && deckNames && (
        <Select
          label={<Text mb={10}>Primary Deck</Text>}
          placeholder="Select deck"
          value={inputPrimaryDeck}
          onChange={updatePrimaryDeck}
          data={deckNames.map((deckName) => {
            return {
              label: deckName,
              value: deckName,
            };
          })}
        />
      )}
    </>
  );
}

export default AnkiPrimaryDeck;
