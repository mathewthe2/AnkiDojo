import { useState, useEffect } from "react";
import { Select } from "@mantine/core";
import { getDeckNames } from "@/lib/anki";

function SearchSettings() {
  const [deckNames, setDeckNames] = useState([]);
  useEffect(() => {
    getDeckNames().then((deckNames) => setDeckNames(deckNames.sort()));
  }, []);
  return (
    <>
      <Select
        clearable
        label="Filter by Deck"
        placeholder="All decks"
        data={deckNames.map((deckName) => {
          return {
            value: deckName,
            label: deckName,
          };
        })}
      ></Select>
    </>
  );
}

export default SearchSettings;
