import {
  ActionIcon,
  Card,
  Group,
  Switch,
  createStyles,
} from "@mantine/core";
import { useState } from "react";
import Dictionary from "@/interfaces/dictionary/Dictionary";
import { deleteDictionary, setDictionayEnabled } from "@/lib/dictionaries";
import { IconTrash } from "@tabler/icons";

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

function DictionaryItem({ dictionary }: { dictionary: Dictionary; }) {
  const { classes } = useStyles();
  const [enabled, setEnabled] = useState(dictionary.enabled);
  const [hidden, setIsHidden] = useState(false);

  const handleToggleEnabled = () => {
    setDictionayEnabled(dictionary.id, !enabled);
    setEnabled(!enabled);
  }

  const handleDeleteDictionary = () => {
    deleteDictionary(dictionary.id);
    setIsHidden(true);
  }

  return (
    <Card className={classes.card} hidden={hidden}>
      <Group position="apart">
        <Switch
          checked={enabled}
          onChange={handleToggleEnabled}
          label={dictionary.name}
        ></Switch>
        <ActionIcon onClick={handleDeleteDictionary}>
          <IconTrash size={18} />
        </ActionIcon>
      </Group>
    </Card>
  )
}

export default DictionaryItem;
