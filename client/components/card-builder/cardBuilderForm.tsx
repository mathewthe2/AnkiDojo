import { useEffect, useState } from "react";
import { getDeckNames, getPrimaryDeck } from "@/lib/anki";
import { Button, Modal, Tabs, Text, Select, Textarea } from "@mantine/core";
import { IconClipboardList, IconBookDownload } from "@tabler/icons";
import CardBuilderPreview from "./cardBuilderPreview";
const mockData = '言葉 \n適当\n行く\n浴びる\nあっち\n来ない'

function CardBuilderForm() {
  const [deckNames, setDeckNames] = useState([]);
  const [inputPrimaryDeck, setInputPrimaryDeck] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);
  const [vocabularyText, setVocabularyTest] = useState(mockData);

  return (
    <>
     <Tabs defaultValue="bulk">
      <Tabs.List>
        <Tabs.Tab value="bulk" icon={<IconClipboardList size={14} />}>Bulk</Tabs.Tab>
        <Tabs.Tab value="kindle" icon={<IconBookDownload size={14} />}>Kindle</Tabs.Tab>      </Tabs.List>

      <Tabs.Panel value="bulk" pt="xs">
      <Textarea
        mt={10}
        minRows={8}
        value={vocabularyText}
        placeholder="Paste your vocabulary by line"
        label="Vocabulary"
        onChange={(e)=>setVocabularyTest(e.target.value)}

      />
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        withCloseButton={false}
        size="70%"
      >
        <CardBuilderPreview expressionList={vocabularyText.split(/[\r\n]+/)} />
      </Modal>
      <Button mt={20} onClick={() => setOpened(true)}>
        Generate
      </Button>
      </Tabs.Panel>

      <Tabs.Panel value="kindle" pt="xs">
        Kindle
      </Tabs.Panel>
    </Tabs>
      
    </>
  );
}

export default CardBuilderForm;
