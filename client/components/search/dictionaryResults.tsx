import { Card, Stack, Text, Group, List } from "@mantine/core";
import { useQuery } from "react-query";
import { ScrollArea } from "@mantine/core";
import { getTermDefinitions } from "@/lib/japanese";
import { Definition } from "@/lib/japanese";
import CardBuilderPitchSvg from "../card-builder/cardBuilderPitchSvg";

function DictionaryResults({ keyword }: { keyword: string }) {
  const { data: definitions, isFetching: isLoading } = useQuery(
    ["terms", keyword],
    () => getTermDefinitions(keyword.split(" ")),
    { enabled: keyword.length > 0 }
  );

  return (
    <ScrollArea mt={20}>
      {definitions &&
        definitions?.map((definition: Definition) => (
          <Card key={definition.expression}>
            <Group mb={20} spacing="xl">
              <Stack>
                <Text size="xl">
                  <ruby>
                    {definition.expression}
                    <rt>{definition.reading}</rt>
                  </ruby>
                </Text>
                {definition.pitch_svg && (
                  <CardBuilderPitchSvg
                    height={40}
                    width={"auto"}
                    pitch_string={definition.pitch_svg[0]}
                  />
                )}
              </Stack>

              {definition.glossary && (
                <List>
                  {definition.glossary.map((glossary) => (
                    <List.Item>{glossary}</List.Item>
                  ))}
                </List>
              )}
            </Group>
          </Card>
        ))}
    </ScrollArea>
  );
}

export default DictionaryResults;
