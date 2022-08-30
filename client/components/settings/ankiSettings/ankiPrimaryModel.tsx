import { useEffect, useState } from 'react';
import { getDeckNames } from '@/lib/anki';
import { Select } from "@mantine/core";

function AnkiPrimaryModel() {
    const [deckNames, setDeckNames] = useState([]);
    useEffect(() => {
        getDeckNames().then((deckNames) => setDeckNames(deckNames.sort()));
      }, []);
    return (
        <>
        {deckNames && (
            <Select
              label="Primary Deck"
              placeholder="Select deck"
              data={deckNames.map((deckName) => {
                return {
                  label: deckName,
                  value: deckName,
                };
              })}
            />
          )}
          </>
    )
}

export default AnkiPrimaryModel