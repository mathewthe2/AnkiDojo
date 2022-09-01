import { useEffect, useState } from "react";
import { Drawer, Card, Text, ScrollArea, UnstyledButton } from "@mantine/core";
import { createStyles } from "@mantine/core";
import { getCardFormats } from "@/lib/anki";
import AnkiCardFormat from "@/interfaces/anki/ankiCardFormat";
import AnkiCardFormatEditForm from "./ankiCardFormatEditForm";
import { useQuery } from "react-query";
import { AnkiSettingType } from "@/lib/anki";

const useStyles = createStyles((theme) => ({
  paper: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    padding: 20,
    marginTop: 10,
    transition: "box-shadow 150ms ease, transform 150ms ease",

    "&:hover": {
      boxShadow: `${theme.shadows.md} !important`,
      transform: "translate(20px);",
    },
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontWeight: 700,
  },
}));
function AnkiCardFormats() {
  const { classes, theme } = useStyles();
  const {data:cardFormats, isLoading:isLoadingCardFormats} = useQuery(AnkiSettingType.CardFormat, getCardFormats)
  const [opened, setOpened] = useState(false);
  const [activeCardFormat, setActiveCardFormat] = useState<AnkiCardFormat>();

  const selectModel = (cardFormat:AnkiCardFormat) => {
    setActiveCardFormat(cardFormat);
    setOpened(true);
  }

  return (
    <>
      <Drawer
        opened={opened}
        position="left"
        onClose={() => setOpened(false)}
        title={<Text weight={700}>{activeCardFormat?.modelName}</Text>}
        padding="md"
        size="xl"
      >
        <AnkiCardFormatEditForm cardFormat={activeCardFormat!} onDeleteCallback={()=>setOpened(false)} />
      </Drawer>
      <ScrollArea mt={10} style={{ height: 500 }}>
        {cardFormats?.map((cardFormat) => (
          <Card shadow="md" key={cardFormat.modelName} className={classes.paper}>
            <UnstyledButton
              style={{ width: "100%" }}
              onClick={() => selectModel(cardFormat)}
            >
              <Text>{cardFormat.modelName}</Text>
            </UnstyledButton>
          </Card>
        ))}
      </ScrollArea>
    </>
  );
}

export default AnkiCardFormats;
