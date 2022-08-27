import { useState, useEffect } from "react";
import { Container, Text, Select } from '@mantine/core';
import { getDeckNames, getModelNames } from "@/lib/anki";

function Settings() {
    const [deckNames, setDeckNames] = useState([]);
    const [modelNames, setModelNames] = useState([]);
    useEffect(() => {
        getDeckNames().then((deckNames) => setDeckNames(deckNames.sort()));
        getModelNames().then((modelNames) => setModelNames(modelNames.sort()));
      }, []);
    return (
        <Container>
            <Text>Settings</Text>
            {deckNames && 
            <Select
            label="Deck"
            placeholder="Pick one"
            data={deckNames.map(deckName=>{
                return {
                    label: deckName,
                    value: deckName
                }
            })}
          />}
        </Container>
    )
}

export default Settings