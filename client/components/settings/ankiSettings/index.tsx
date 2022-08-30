import { useState } from "react";
import {
  Modal,
  Box,
  Divider,
  Button,
  Group,
  Text,
  createStyles,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons";
import AnkiPrimaryModel from "./ankiPrimaryModel";
import AnkiCardFormats from "./ankiCardFormats";
import AnkiCardFormatForm from "./ankiCardFormatForm";

const useStyles = createStyles((theme) => ({
  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontWeight: 700,
  },
}));

function AnkiSettings() {
  const [opened, setOpened] = useState(false);
  const { classes, theme } = useStyles();

  return (
    <Box mt={20}>
      <Text mb={20} className={classes.title}>
        Anki Settings
      </Text>
     <AnkiPrimaryModel/>
     <Divider mt={20} />
     <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="New Anki Card Format"
      >
        <AnkiCardFormatForm/>
      </Modal>
      <Button mt={20} fullWidth onClick={() => setOpened(true)}>
        <Group>
          <IconPlus />
          Add Card Format
        </Group>
      </Button>
      <AnkiCardFormats/>
    </Box>
  );
}

export default AnkiSettings;
