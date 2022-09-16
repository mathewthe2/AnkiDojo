import { useState } from "react";
import {
  Modal,
  Box,
  Tabs,
  Button,
  Group,
  Text,
  Card,
  createStyles,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons";
import AnkiPrimaryDeck from "./ankiPrimaryDeck";
import AnkiCardFormats from "./ankiCardFormats";
import AnkiCardFormatForm from "./ankiCardFormatForm";
import AnkiEnableSuspendedSwitch from "./ankiEnableSuspendedSwitch";

const useStyles = createStyles((theme) => ({
  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontWeight: 700,
  },
  card: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
  },
}));

function AnkiSettings() {
  const [opened, setOpened] = useState(false);
  const { classes, theme } = useStyles();

  return (
    <Box mt={20}>
      <Text mb={20} className={classes.title}>
        Anki
      </Text>
      <AnkiPrimaryDeck />
      <Tabs mt={20} defaultValue="card-formats">
        <Tabs.List>
          <Tabs.Tab value="card-formats">Card Formats</Tabs.Tab>
          <Tabs.Tab value="advanced">Advanced</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="card-formats" pt="xs">
          <Modal
            opened={opened}
            onClose={() => setOpened(false)}
            title="New Anki Card Format"
          >
            <AnkiCardFormatForm onCreateCallback={() => setOpened(false)} />
          </Modal>
          <Button mt={10} onClick={() => setOpened(true)}>
            <Group>
              <IconPlus />
              Add Card Format
            </Group>
          </Button>
          <AnkiCardFormats />
        </Tabs.Panel>

        <Tabs.Panel value="advanced" pt="xs">
          <Card className={classes.card}>
            <AnkiEnableSuspendedSwitch />
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}

export default AnkiSettings;
