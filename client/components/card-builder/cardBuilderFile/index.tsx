import { useEffect, useState } from "react";
import { useMantineTheme, Group, Modal, Text, NavLink } from "@mantine/core";
import {
  Dropzone,
  MIME_TYPES,
  FileWithPath,
} from "@mantine/dropzone";
import CardBuilderPreview from "../cardBuilderPreview";
import ExpressionTerm from "@/interfaces/card_builder/ExpressionTerm";
import createExpressionList from "@/lib/card-builder/createExpressionList";
import RawNoteAddInterface from "@/interfaces/card_builder/RawNoteAddInterface";
import { IconUpload, IconX, IconFile } from "@tabler/icons";
import { rawNotesToExpressionTerms, jsonNotesToExpressionTerms } from "@/lib/card-builder/notes";
import csvtojson from 'csvtojson';

function CardBuilderFile({
  isVocabularyGeneration,
}: {
  isVocabularyGeneration?: boolean;
}) {
  const theme = useMantineTheme();
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [dropModalOpened, setDropModalOpened] = useState(false);
  const [expressionTerms, setExpressionTerms] = useState<ExpressionTerm[]>([]);
  const [passages, setPassages] = useState<string[]>([]);
  const [previewOpened, setPreviewOpened] = useState(false);

  useEffect(() => {
    if (files.length > 0) {
      // console.log(files[0]);
      handleFile(files[0]);
    }
  }, [files]);

  const handleFile = (file: FileWithPath) => {
    switch (file.type) {
      case "text/plain": {
        const reader = new FileReader();
        reader.onload = function (e) {
          const content = reader.result as string;
          if (isVocabularyGeneration) {
            setExpressionTerms(createExpressionList(content!.split(/[\r\n]+/)));
            setPassages([]);
          } else {
            setExpressionTerms([]);
            setPassages([content]);
          }
          setDropModalOpened(false);
          setPreviewOpened(true);
        };
        reader.readAsText(file);
        break;
      }
      case "application/json": {
        const reader = new FileReader();
        reader.onload = function (e) {
          const content = JSON.parse(reader.result as string);
          if (content && content.length > 0) {
            const rawNotes: RawNoteAddInterface[] = content.map(
              (noteData: any) => {
                return {
                  ...noteData,
                  fields: new Map(Object.entries(noteData.fields)),
                  options: new Map(Object.entries(noteData.options)),
                };
              }
            );
            setExpressionTerms(rawNotesToExpressionTerms(rawNotes));
            setDropModalOpened(false);
            setPreviewOpened(true);
          }
        };
        reader.readAsText(file);
        break;
      }
      case MIME_TYPES.csv: {
        const reader = new FileReader();
        reader.onload = function (e) {
          const content = reader.result as string;
          csvtojson()
            .fromString(content)
            .then((jsonNotes) => {
              if (jsonNotes && jsonNotes.length > 0) {
                setExpressionTerms(jsonNotesToExpressionTerms(jsonNotes));
                setDropModalOpened(false);
                setPreviewOpened(true);
              }
            })
        };
        reader.readAsText(file);
        break;
      }
      default:
        break;
    }
  };

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
          accept={["text/plain", MIME_TYPES.csv, "application/json"]}
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
                *txt, csv, json
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
          expressionList={expressionTerms}
          passages={passages}
          onSuccessCallback={() => setPreviewOpened(false)}
        />
      </Modal>
    </div>
  );
}

export default CardBuilderFile;
