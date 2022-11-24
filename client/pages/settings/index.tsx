import { Container, Tabs } from "@mantine/core";
import AnkiSettings from "@/components/settings/ankiSettings";
import WordSettings from "@/components/settings/wordSettings";
import DictionariesSettings from "@/components/settings/dictionariesSettings";

function Settings() {
  return (
    <Container fluid>
      <Tabs mt={42} defaultValue="anki">
        <Tabs.List>
          <Tabs.Tab value="anki">Anki</Tabs.Tab>
          <Tabs.Tab value="dictionaries">Dictionaries</Tabs.Tab>
          <Tabs.Tab value="known_words">Known Words</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="anki" pt="xs">
          <AnkiSettings />
        </Tabs.Panel>
        <Tabs.Panel value="dictionaries" pt="xs">
          <DictionariesSettings />
        </Tabs.Panel>
        <Tabs.Panel value="known_words" pt="xs">
          <WordSettings />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}

export default Settings;
