import { useState } from "react";
import {
  Button,
  Drawer,
  Modal,
  Group,
  Title,
  Textarea,
  Grid,
  Text,
  Tabs,
  ActionIcon,
} from "@mantine/core";
import CardBuilderPhoto from "./cardBuilderPhoto";
import CardBuilderFile from "./cardBuilderFile";
import CardBuilderPreview from "./cardBuilderPreview";
import CardBuilderKindle from "./cardBuilderKindle";
const mockVocabularyData = "言葉 \n適当\n行く\n浴びる\nあっち\n来ない";
const mockPassageData = "お腹減ったから、コンビニで食べ物を買って来たよ";
import createExpressionList from "@/lib/card-builder/createExpressionList";
import { IconSettings } from "@tabler/icons";
import { toHiragana } from "wanakana";
import CardBuilderSettings from "./cardBuilderSettings";

function CardBuilderForm() {
  const [opened, setOpened] = useState(false);
  const [settingsOpened, setSettingsOpened] = useState(false);
  const [userText, setUserText] = useState("");
  const [activeTab, setActiveTab] = useState<string | null>("vocabulary");

  const isVocabularyGeneration = () => activeTab === "vocabulary";

  const createWordList = (keywords: string[]) => {
    const words = keywords.map((word) =>
      word.match(/[a-z]/i) ? toHiragana(word) : word
    );
    return createExpressionList(words);
  };

  return (
    <>
      <Title mb={10}>Card Builder</Title>

      <Tabs value={activeTab} onTabChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="vocabulary">Vocabulary</Tabs.Tab>
          <Tabs.Tab value="passage">Passage</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="vocabulary" pt="xs">
          <Grid>
            <Grid.Col span={10}>
              <Textarea
                minRows={20}
                value={userText}
                placeholder={mockVocabularyData}
                onChange={(e) => setUserText(e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={2}>
              <Text pl={12} size="xs" color="dimmed">
                General
              </Text>
              <CardBuilderPhoto />
              <CardBuilderFile />
              <Text pl={12} pt={10} size="xs" color="dimmed">
                Reader
              </Text>
              <CardBuilderKindle />
            </Grid.Col>
          </Grid>
        </Tabs.Panel>
        <Tabs.Panel value="passage" pt="xs">
          <Grid>
            <Grid.Col span={10}>
              <Textarea
                minRows={20}
                value={userText}
                placeholder={mockPassageData}
                onChange={(e) => setUserText(e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={2}>
              <Text pl={12} size="xs" color="dimmed">
                General
              </Text>
              <CardBuilderPhoto />
              <CardBuilderFile />
              {/* <Text pl={12} pt={10} size="xs" color="dimmed">
                Reader
              </Text>
              <CardBuilderKindle /> */}
            </Grid.Col>
          </Grid>
        </Tabs.Panel>
      </Tabs>

      <Modal
        centered
        opened={opened}
        onClose={() => setOpened(false)}
        withCloseButton={false}
        size="80%"
      >
        <CardBuilderPreview
          expressionList={
            isVocabularyGeneration()
              ? createWordList(userText.split(/[\r\n]+/))
              : []
          }
          passages={isVocabularyGeneration() ? [] : [userText]}
          onSuccessCallback={() => setOpened(false)}
        />
      </Modal>
      <Grid>
        <Grid.Col span={10}>
          <Group position="apart">
            <Button
              mt={20}
              onClick={() => setOpened(true)}
              disabled={userText.length === 0}
            >
              Generate
            </Button>
            <ActionIcon onClick={() => setSettingsOpened(true)}>
              <IconSettings />
            </ActionIcon>
            <Drawer
              opened={settingsOpened}
              onClose={() => setSettingsOpened(false)}
              title="Card Builder Setting"
              padding="xl"
              size="xl"
              position="right"
            >
              <CardBuilderSettings />
            </Drawer>
          </Group>
        </Grid.Col>
        <Grid.Col span={2}></Grid.Col>
      </Grid>
    </>
  );
}

export default CardBuilderForm;
