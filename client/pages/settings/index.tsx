import { Container, Tabs } from "@mantine/core";
import AnkiSettings from "@/components/settings/ankiSettings";

function Settings() {
  return (
    <Container fluid>
      <Tabs mt={42} defaultValue="anki">
        <Tabs.List>
          <Tabs.Tab value="anki">Anki</Tabs.Tab>
          <Tabs.Tab value="known_words">Known Words</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="anki" pt="xs">
          <AnkiSettings />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}

export default Settings;
