import { useEffect, useState } from "react";
import { Text, Select } from "@mantine/core";
import { getDeckNames, getPrimaryDeck } from "@/lib/anki";

function AnkiPrimaryDeck() {
  const [deckNames, setDeckNames] = useState([]);
  const [primaryDeck, setPrimaryDeck] = useState<string | null>(null);
  useEffect(() => {
    getDeckNames().then((deckNames) => setDeckNames(deckNames.sort()));
    getPrimaryDeck().then((primaryDeck) => setPrimaryDeck(primaryDeck));
  }, []);
  return (
    <>
      {deckNames && (
        <Select
          label={<Text mb={10}>Primary Deck</Text>}
          placeholder="Select deck"
          value={primaryDeck}
          onChange={setPrimaryDeck}
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
