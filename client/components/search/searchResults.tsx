import {
  ScrollArea,
  UnstyledButton,
  Card,
  Group,
  Text,
  Image,
} from "@mantine/core";
import AnkiNote from "@/interfaces/anki/ankiNote";
import { parseExactSentenceWithFurigana } from "@/lib/search/parser";
import { createStyles } from "@mantine/core";
import useAudioPlayer from "@/hooks/media/useAudioPlayer";
import { FieldValueType } from "@/lib/anki";

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
  },

  button: {
    // display: 'block',
    // overflowWrap: 'normal',
    cursor: 'pointer',
    "&:hover": {
      textDecoration: "underline",
    },
  },
}));

function SearchResults({
  notes,
  keyword,
}: {
  notes: AnkiNote[];
  keyword: string;
}) {
  const { classes, theme } = useStyles();
  const { playAudio } = useAudioPlayer({ playbackSpeed: 1.0 });
  return (
    <ScrollArea mt={20}>
      {notes.map((note: AnkiNote) => {
        const sentenceAudio = note?.fields.get(FieldValueType.SentenceAudio);
        const hasSentenceAudio = sentenceAudio && sentenceAudio.length > 0;
        return (
          <Card key={note.noteId} mb={10}>
            <Group noWrap>
              {note.fields.get(FieldValueType.Picture) && (
                <Image
                  width={200}
                  height={120}
                  src={note.fields.get(FieldValueType.Picture)}
                  alt={note.noteId.toString()}
                  withPlaceholder
                />
              )}
              {hasSentenceAudio ? (
                  <Text size="xl" className={classes.button}  onClick={() => playAudio(sentenceAudio)}>
                    {parseExactSentenceWithFurigana({
                      exampleId: note?.noteId,
                      sentence: note?.fields.get(FieldValueType.Sentence),
                      sentenceWithFurigana: note?.fields.get(
                        FieldValueType.Sentence
                      ),
                      keyword: keyword,
                    })}
                  </Text>
              ) : (
                <Text size="xl">
                  {parseExactSentenceWithFurigana({
                    exampleId: note?.noteId,
                    sentence: note?.fields.get(FieldValueType.Sentence),
                    sentenceWithFurigana: note?.fields.get(
                      FieldValueType.Sentence
                    ),
                    keyword: keyword,
                  })}
                </Text>
              )}
            </Group>
          </Card>
        );
      })}
    </ScrollArea>
  );
}

export default SearchResults;
