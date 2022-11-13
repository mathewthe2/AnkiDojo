import NoteResult from "@/interfaces/card_builder/NoteResultInterface";
import { Button, ScrollArea, Center, Text } from "@mantine/core";

function CardBuilderResult({
  noteResults,
  expressionKey,
  onSuccessCallback,
}: {
  noteResults: NoteResult[];
  expressionKey: String;
  onSuccessCallback?: Function;
}) {
  if (noteResults.length === 0) {
    return (
      <Center>
        <Text weight={700}>Nothing to add!</Text>
      </Center>
    );
  }
  return (
    <>
      <Center>
        <Text weight={700}>Added!</Text>
      </Center>
      <ScrollArea.Autosize maxHeight={500} style={{ width: "100%" }} mx="auto">
        {noteResults.map((noteResult) => (
          <Center key={noteResult.id}>
            <Text>{noteResult.fields.get(expressionKey)}</Text>
            <br />
          </Center>
        ))}
      </ScrollArea.Autosize>
      <Center pt={30}>
        <Button onClick={()=>onSuccessCallback?.()}>Done</Button>
      </Center>
    </>
  );
}

export default CardBuilderResult;
