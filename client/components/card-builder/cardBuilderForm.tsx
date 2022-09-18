import { useEffect, useState } from "react";
import { Button, Modal, Tabs, Textarea, Grid, NavLink } from "@mantine/core";
import {
  IconClipboardList,
  IconBookDownload,
  IconFileUpload,
} from "@tabler/icons";
import CardBuilderPhoto from "./cardBuilderPhoto";
import CardBuilderFile from "./cardBuilderFile";
import CardBuilderPreview from "./cardBuilderPreview";
const mockData = "言葉 \n適当\n行く\n浴びる\nあっち\n来ない";

function CardBuilderForm() {
  const [opened, setOpened] = useState(false);
  const [vocabularyText, setVocabularyText] = useState("");

  return (
    <>
      <Tabs defaultValue="bulk">
        <Tabs.List>
          <Tabs.Tab value="bulk" icon={<IconClipboardList size={14} />}>
            Bulk
          </Tabs.Tab>
          <Tabs.Tab value="kindle" icon={<IconBookDownload size={14} />}>
            Kindle
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="bulk" pt="xs">
          <Grid>
            <Grid.Col span={10} >
              <Textarea
                // mt={10}
                minRows={20}
                value={vocabularyText}
                placeholder={mockData}
                // label="Vocabulary"
                onChange={(e) => setVocabularyText(e.target.value)}
              />
              <Modal
                centered
                opened={opened}
                onClose={() => setOpened(false)}
                withCloseButton={false}
                size="70%"
              >
                <CardBuilderPreview
                  expressionList={vocabularyText.split(/[\r\n]+/)}
                />
              </Modal>
              <Button
                mt={20}
                onClick={() => setOpened(true)}
                disabled={vocabularyText.length === 0}
              >
                Generate
              </Button>
            </Grid.Col>
            <Grid.Col span={2}>
              <CardBuilderPhoto />
              <CardBuilderFile />
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="kindle" pt="xs">
          Kindle
        </Tabs.Panel>
      </Tabs>
    </>
  );
}

export default CardBuilderForm;
