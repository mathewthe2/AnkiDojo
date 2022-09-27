import { useEffect, useState } from "react";
import {
  useMantineTheme,
  Group,
  Modal,
  Text,
  NavLink,
} from "@mantine/core";
import {
  Dropzone,
  DropzoneProps,
  MIME_TYPES,
  FileWithPath,
} from "@mantine/dropzone";
import CardBuilderPreview from "../cardBuilderPreview";
import ExpressionTerm from "@/interfaces/card_builder/ExpressionTerm";
import createExpressionList from "@/lib/card-builder/createExpressionList";
import { IconUpload, IconX, IconFile } from "@tabler/icons";

function CardBuilderFile({isVocabularyGeneration}:{isVocabularyGeneration?:boolean}) {
  const theme = useMantineTheme();
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [dropModalOpened, setDropModalOpened] = useState(false);
  const [userText, setUserText] = useState('');
  const [previewOpened, setPreviewOpened] = useState(false);

  useEffect(() => {
    if (files.length > 0) {
      console.log(files[0]);
      handleFile(files[0]);
    }
  }, [files]);

  const handleFile = (file: FileWithPath) => {
    switch (file.type) {
      case "text/plain":
        const reader = new FileReader();
        reader.onload = function (e) {
          const content = reader.result as string;
          setUserText(content);
          // previewVocabulary(content!.split(/[\r\n]+/));
          setDropModalOpened(false);
          setPreviewOpened(true);
        };
        reader.readAsText(file);
        break;
      default:
        break;
    }
  };

  // const previewVocabulary = (vocabularyItems: string[]) => {
  //   // setExpressionList(createExpressionList(vocabularyItems));
  //   setDropModalOpened(false);
  //   setPreviewOpened(true);
  // };

  return (
    <div>
      <NavLink
        onClick={() => setDropModalOpened(true)}
        icon={<IconFile size={16} stroke={1.5} />}
        label="File"
      ></NavLink>
      <Modal
        centered
        withCloseButton={false}
        opened={dropModalOpened}
        size="xl"
        onClose={() => setDropModalOpened(false)}
      >
        <Dropzone
          onDrop={setFiles}
          onReject={(files) => console.log("rejected files", files)}
          multiple={false}
          accept={[
            "text/plain"
          ]}
          // accept={[
          //   MIME_TYPES.csv,
          //   "text/tsv",
          //   "text/plain",
          //   "application/json",
          // ]}
        >
          <Group
            position="center"
            spacing="xl"
            style={{ minHeight: 220, pointerEvents: "none" }}
          >
            <Dropzone.Accept>
              <IconUpload
                size={50}
                stroke={1.5}
                color={
                  theme.colors[theme.primaryColor][
                    theme.colorScheme === "dark" ? 4 : 6
                  ]
                }
              />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX
                size={50}
                stroke={1.5}
                color={theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]}
              />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconFile size={50} stroke={1.5} />
            </Dropzone.Idle>

            <div>
              <Text size="xl" inline>
                Drag file here or click to select file
              </Text>
              <Text size="sm" color="dimmed" inline mt={7}>
                *txt
              </Text>
            </div>
          </Group>
        </Dropzone>
      </Modal>
      <Modal
        centered
        opened={previewOpened}
        onClose={() => setPreviewOpened(false)}
        withCloseButton={false}
        size="80%"
      >
       <CardBuilderPreview
          expressionList={isVocabularyGeneration ? createExpressionList(userText!.split(/[\r\n]+/)) : []}
          passages={isVocabularyGeneration ? [] : [userText]}
        />
      </Modal>
    </div>
  );
}

export default CardBuilderFile;
