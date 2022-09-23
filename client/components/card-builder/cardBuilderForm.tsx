import { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Tabs,
  Title,
  Textarea,
  Grid,
} from "@mantine/core";
import CardBuilderPhoto from "./cardBuilderPhoto";
import CardBuilderFile from "./cardBuilderFile";
import CardBuilderPreview from "./cardBuilderPreview";
import CardBuilderKindle from "./cardBuilderKindle";
const mockData = "言葉 \n適当\n行く\n浴びる\nあっち\n来ない";
import createExpressionList from "@/lib/card-builder/createExpressionList";

function CardBuilderForm() {
  const [opened, setOpened] = useState(false);
  const [vocabularyText, setVocabularyText] = useState("");

  return (
    <>
      <Grid>
        <Grid.Col span={10}>
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
              expressionList={createExpressionList(vocabularyText.split(/[\r\n]+/))}
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
          <CardBuilderKindle/>
        </Grid.Col>
      </Grid>
      {/* </Tabs.Panel> */}

      {/* <Tabs.Panel value="kindle" pt="xs">
          Kindle
        </Tabs.Panel> */}
      {/* </Tabs> */}
    </>
  );
}

export default CardBuilderForm;
