import NoteResult, { AddedNote, SkippedNote } from "@/interfaces/card_builder/NoteResultInterface";
import { Button, ScrollArea, Center, Text } from "@mantine/core";

function CardBuilderResult({
  noteResult,
  expressionKey,
  onSuccessCallback,
}: {
  noteResult?: NoteResult;
  expressionKey: String;
  onSuccessCallback?: Function;
}) {
  if (noteResult == undefined || (noteResult.addedNotes.length <= 0 && noteResult.skippedNotes.length <= 0)) {
    return (
      <Center>
        <Text weight={700}>Failed to add notes. Please ensure Anki is running.</Text>
      </Center>
    );
  }
  return (
    <>
      <NoteList actionLabel='Added' notes={noteResult.addedNotes} expressionKey={expressionKey}></NoteList>
      <NoteList actionLabel='Skipped' notes={noteResult.skippedNotes} expressionKey={expressionKey}></NoteList>
      <Center pt={30}>
        <Button onClick={() => onSuccessCallback?.()}>Done</Button>
      </Center>
    </>
  );
}

function NoteList({
  notes,
  expressionKey,
  actionLabel,
}: {
  notes: AddedNote[] | SkippedNote[];
  expressionKey: String;
  actionLabel: String
}) {
  if (notes.length == 0) {
    return <></>
  }
  return (
    <>
      <Center pt={30}>
        <Text weight={700}>{actionLabel} {notes.length} card{notes.length > 1 && 's'}</Text>
      </Center>
      <ScrollArea.Autosize maxHeight={250} style={{ width: "100%" }} mx="auto">
        {notes.map((note, index) => (
          <Center key={`note_${note.fields.get(expressionKey)}_${index}`}>
            <Text>{note.fields.get(expressionKey)}</Text>
            <br />
          </Center>
        ))}
      </ScrollArea.Autosize>
    </>
  )
}

export default CardBuilderResult;
