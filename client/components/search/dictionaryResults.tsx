import { Card, Stack, Text, Group, List, Select } from "@mantine/core";
import { useQuery } from "react-query";
import { ScrollArea } from "@mantine/core";
import { getTermDefinitions } from "@/lib/japanese";
import { Definition } from "@/lib/japanese";
import CardBuilderPitchSvg from "../card-builder/cardBuilderPitchSvg";
import { toHiragana } from "wanakana";

function DictionaryResults({ keyword }: { keyword: string }) {
  const { data: definitions, isFetching: isLoading } = useQuery(
    ["terms", keyword],
    () => getTermDefinitions({keywords: getKeywords(keyword.split(" ")), include_audio_urls: false}),
    { enabled: keyword.length > 0 }
  );

  const getKeywords = (keywords: string[]) => {
    return keywords.map((word) =>
      word.match(/[a-z]/i) ? toHiragana(word) : word
    );
  };

  return (
    <ScrollArea mt={20}>
      {definitions &&
        definitions.length > 0 &&
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
              </Stack>

              {definition.glossary && (
                <List>
                  {definition.glossary.map((glossary) => (
                    <List.Item>{glossary}</List.Item>
                  ))}
                </List>
              )}
            </Group>
            {definition.pitch_svg && (
              <Group style={{ float: "left" }}>
                {definition.pitch_svg.map((pitch_svg) => (
                  <CardBuilderPitchSvg
                    height={40}
                    key={pitch_svg}
                    width={"auto"}
                    pitch_string={pitch_svg}
                  />
                ))}
              </Group>
            )}
          </Card>
        ))}
    </ScrollArea>
  );
}

export default DictionaryResults;
