import { useEffect, useState } from "react";
import {
  Center,
  Skeleton,
  Title,
  Menu,
  Text,
  NavLink,
  ScrollArea,
  Card,
  createStyles,
  Button,
  Select,
  Table,
  ActionIcon,
  UnstyledButton,
  Highlight,
  Loader,
} from "@mantine/core";
import { getTermDefinitions } from "@/lib/japanese";
import {
  getDeckNames,
  getPrimaryDeck,
  getCardFormats,
  FieldValueType,
} from "@/lib/anki";
import { Howl } from "howler";
import { addNotesToAnki } from "@/lib/card-builder/notes";
import { NoteAddInterface } from "@/interfaces/card_builder/NoteAddInterface";
import { IconVolume, IconVolume3, IconX } from "@tabler/icons";
import AnkiCardFormat from "@/interfaces/anki/ankiCardFormat";
import CardBuilderPitchSvg from "./cardBuilderPitchSvg";
import ExpressionTerm from "@/interfaces/card_builder/ExpressionTerm";
import { NoteMedia } from "@/interfaces/card_builder/NoteMedia";
import { AudioUrl } from "@/lib/japanese";

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
  },
  pitchButton: {
    borderRadius: "10px",
    paddingTop: 5,
    paddingBottom: 5,
    "&:hover": {
      background:
        theme.colorScheme === "dark"
          ? theme.colors.gray[6]
          : theme.colors.dark[1],
    },
  },
}));

function CardBuilderPreview({
  expressionList,
}: {
  expressionList: ExpressionTerm[];
}) {
  const [deckNames, setDeckNames] = useState([]);
  const [selectedDeckName, setSelectedDeckName] = useState("");
  const [cardFormatModelName, setCardFormatModelName] = useState("");
  const [cardFormats, setCardFormats] = useState<AnkiCardFormat[]>([]);
  const [expressionTerms, setExpressionTerms] = useState<ExpressionTerm[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasSentences, setHasSentences] = useState(false);
  const [streamingAudioUrls, setStreamingAudioUrls] = useState<Set<string>>(
    new Set()
  );
  const { classes, theme } = useStyles();

  useEffect(() => {
    getDeckNames().then((deckNames) => setDeckNames(deckNames.sort()));
    getPrimaryDeck().then((primaryDeck) => setSelectedDeckName(primaryDeck));
    getCardFormats().then((cardFormats) => {
      setCardFormats(cardFormats);
      if (cardFormats.length > 0) {
        setCardFormatModelName(cardFormats[0].modelName);
      }
    });
    // combine existing definition (including sentence) with anki definition
    getTermDefinitions(
      expressionList.map(
        (expression: ExpressionTerm) => expression.userExpression
      )
    ).then((definitions) => {
      if (!isLoaded && expressionList.length === definitions?.length) {
        setExpressionTerms(
          expressionList.map((expression: ExpressionTerm, index: number) => {
            if (
              typeof expression.definition != "undefined" &&
              expression.definition
            ) {
              setHasSentences(true);
            }
            return {
              userExpression: expression.userExpression,
              definition: { ...expression.definition, ...definitions[index] },
            };
          })
        );
      }
      setIsLoaded(true);
    });
  }, []);

  const removeTerm = (index: number) => {
    const terms = [...expressionTerms];
    terms.splice(index, 1);
    setExpressionTerms(terms);
  };

  const addGlossaryTerm = (index: number, value: string) => {
    const terms = [...expressionTerms];
    if (
      typeof terms[index].definition != "undefined" &&
      terms[index].definition
    ) {
      terms[index].definition!.glossary = [
        ...(terms[index].definition!.glossary as string[]),
        value,
      ];
      terms[index].definition!.selectedGlossary = value;
    }
    setExpressionTerms(terms);
  };

  const updateTextOfTermDefinitions = (
    index: number,
    key: string,
    value: string
  ) => {
    setExpressionTerms(
      [...expressionTerms].map((term, termIndex) => {
        if (termIndex === index) {
          switch (key) {
            case FieldValueType.Expression:
              return { ...term, expression: value };
            case FieldValueType.Reading:
              return { ...term, reading: value };
            case FieldValueType.Glossary:
              return {
                ...term,
                definition: { ...term.definition, selectedGlossary: value },
              };
            case FieldValueType.Audio:
              return {
                ...term,
                definition: { ...term.definition, selectedAudioUrl: value },
              };
          }
        } else {
          return term;
        }
      }) as ExpressionTerm[]
    );
  };

  const getWordAudio = (audioField: string, expressionTerm: ExpressionTerm) => {
    const kanji = expressionTerm.definition?.expression || "";
    const kana = expressionTerm.definition?.reading || "";
    const audio: NoteMedia = {
      url:
        expressionTerm.definition?.selectedAudioUrl ||
        expressionTerm.definition?.audio_urls?.[0].url ||
        "",
      filename: `AnkiDojo_${kanji}_${kana}.mp3`,
      fields: audioField.length > 0 ? [audioField] : [],
    };
    return audio;
  };

  const playWordAudio = (soundUrl: string) => {
    const soundUrlWithProxy = `${process.env.PROXY}/${encodeURIComponent(
      soundUrl
    )}`;
    setStreamingAudioUrls(
      (audioUrls) => new Set([...Array.from(audioUrls), soundUrl])
    );
    var sound = new Howl({
      src: [soundUrlWithProxy],
      html5: true,
      format: ["mp3"],
      onplay: () => {
        setStreamingAudioUrls(
          (audioUrls) =>
            new Set([...Array.from(audioUrls)].filter((x) => x !== soundUrl))
        );
      },
    });
    sound.play();
  };

  const bulkAddToAnki = () => {
    const modelMap = cardFormats.find(
      (cardFormat) => cardFormat.modelName === cardFormatModelName
    )?.modelMap;
    // map fields to corresponding names in card format
    const fieldMaps: Map<string, string>[] = [];
    const audioList: NoteMedia[] = [];
    expressionTerms.forEach((expressionTerm, index) => {
      const fieldMap = new Map<string, string>();
      modelMap?.forEach((value: string, key: string) => {
        switch (value) {
          case FieldValueType.Expression:
            fieldMap.set(key, expressionTerm.definition?.expression || "");
            break;
          case FieldValueType.Reading:
            fieldMap.set(key, expressionTerm.definition?.reading || "");
            break;
          case FieldValueType.Glossary:
            fieldMap.set(
              key,
              expressionTerm.definition?.selectedGlossary ||
                expressionTerm.definition?.glossary?.[0] ||
                ""
            );
            break;
          case FieldValueType.PitchAccent:
            fieldMap.set(key, expressionTerm.definition?.pitch_svg?.[0] || ""); // TODO: change selected pitch
            break;
          case FieldValueType.Sentence:
            fieldMap.set(key, expressionTerm.definition?.sentence || ""); // TODO: change selected pitch
            break;
          case FieldValueType.Audio:
            audioList[index] = getWordAudio(key, expressionTerm);
            break;
          default:
            break;
        }
      });
      fieldMaps.push(fieldMap);
    });

    const notesToAdd: NoteAddInterface[] = fieldMaps.map((fieldMap, index) => {
      return {
        deckName: selectedDeckName,
        modelName: cardFormatModelName,
        fields: fieldMap,
        audio: [audioList[index]],
        tags: [],
      };
    });
    addNotesToAnki(notesToAdd);
  };

  if (!isLoaded) {
    return <Skeleton height={400} />;
  } else if (expressionTerms.length === 0) {
    return <Center>No words added!</Center>;
  }

  return (
    <>
      <Title color="dimmed" order={5} style={{ textAlign: "center" }}>
        {expressionTerms.length}{" "}
        {expressionTerms.length === 1 ? "Word" : "Words"}
      </Title>
      <ScrollArea.Autosize maxHeight={500} style={{ width: "100%" }} mx="auto">
        <Table striped mb={10} ml={5}>
          <thead>
            <tr style={{ marginLeft: 5 }}>
              <th style={{ textAlign: "center" }}></th>
              <th style={{ textAlign: "center" }}>Expression</th>
              <th style={{ textAlign: "center" }}>Reading</th>
              <th style={{ textAlign: "center" }}>Glossary</th>
              <th style={{ textAlign: "center" }}>Pitch</th>
              {hasSentences && (
                <th style={{ textAlign: "center" }}>Sentence</th>
              )}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {expressionTerms.map((expressionTerm, index) => (
              <tr key={`expression_${index}`}>
                <td style={{ maxWidth: 20 }}>
                  <Menu
                    trigger="hover"
                    openDelay={400}
                    closeDelay={400}
                    withinPortal
                  >
                    <Menu.Target>
                      <ActionIcon
                        variant="transparent"
                        onClick={() =>
                          playWordAudio(
                            expressionTerm.definition?.selectedAudioUrl || expressionTerm.definition?.audio_urls?.[0].url || ""
                          )
                        }
                      >
                        <IconVolume size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown style={{ background: theme.colors.dark[7] }}>
                      <Menu.Label>Sources</Menu.Label>
                      {expressionTerm.definition?.audio_urls?.map(
                        (audioUrl: AudioUrl, audioIndex: number) => (
                          <NavLink
                            key={`audiolink_${audioIndex}`}
                            onClick={() => {
                              playWordAudio(audioUrl.url);
                              updateTextOfTermDefinitions(
                                index,
                                FieldValueType.Audio,
                                audioUrl.url
                              );
                            }}
                            color="pink"
                            variant="light"
                            label={audioUrl.name}
                            rightSection={
                              <Loader
                                size="xs"
                                style={{
                                  visibility: streamingAudioUrls.has(
                                    audioUrl.url
                                  )
                                    ? "visible"
                                    : "hidden",
                                }}
                              />
                            }
                            active={
                              expressionTerm.definition?.selectedAudioUrl
                                ? audioUrl.url ===
                                  expressionTerm.definition?.selectedAudioUrl
                                : audioIndex === 0
                            }
                          />
                        )
                      )}
                    </Menu.Dropdown>
                  </Menu>
                </td>
                <td
                  suppressContentEditableWarning
                  contentEditable
                  onInput={(e) =>
                    updateTextOfTermDefinitions(
                      index,
                      FieldValueType.Expression,
                      e.currentTarget.textContent || ""
                    )
                  }
                  style={{
                    textAlign: "center",
                    fontSize: "24px",
                    minWidth: 100,
                  }}
                >
                  {expressionTerm.definition?.expression}
                </td>
                <td
                  suppressContentEditableWarning
                  contentEditable
                  onInput={(e) =>
                    updateTextOfTermDefinitions(
                      index,
                      FieldValueType.Reading,
                      e.currentTarget.textContent || ""
                    )
                  }
                  style={{
                    textAlign: "center",
                    fontSize: "18px",
                    minWidth: 100,
                  }}
                >
                  {expressionTerm.definition?.reading}
                </td>
                <td
                  suppressContentEditableWarning
                  style={{ textAlign: "left", minWidth: 100 }}
                  contentEditable={
                    expressionTerm.definition?.glossary?.length == 1
                  }
                  onInput={(e) =>
                    updateTextOfTermDefinitions(
                      index,
                      FieldValueType.Glossary,
                      e.currentTarget.textContent || ""
                    )
                  }
                >
                  {expressionTerm.definition?.glossary &&
                    expressionTerm.definition.glossary.length === 1 &&
                    expressionTerm.definition?.glossary?.[0]}
                  {expressionTerm.definition?.glossary &&
                    expressionTerm.definition.glossary.length > 1 && (
                      <Select
                        searchable
                        creatable
                        getCreateLabel={(query) => `+ Use glossary: ${query}`}
                        onCreate={(query) => {
                          // this will override onchange
                          addGlossaryTerm(index, query);
                          return query;
                        }}
                        defaultValue={expressionTerm.definition?.glossary?.[0]}
                        data={expressionTerm.definition?.glossary || []}
                        onChange={(newValue) =>
                          updateTextOfTermDefinitions(
                            index,
                            FieldValueType.Glossary,
                            newValue || ""
                          )
                        }
                      ></Select>
                    )}
                </td>
                <td style={{ margin: "0 auto" }}>
                  {expressionTerm.definition?.pitch_svg &&
                    expressionTerm.definition.pitch_svg.length > 0 && (
                      <Menu shadow="md" width={200} withinPortal>
                        <Menu.Target>
                          <UnstyledButton className={classes.pitchButton}>
                            <CardBuilderPitchSvg
                              height={50}
                              width={"auto"}
                              pitch_string={
                                expressionTerm.definition?.pitch_svg?.[0] || ""
                              }
                            />
                          </UnstyledButton>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Label>Pitch Accents</Menu.Label>
                          {expressionTerm.definition?.pitch_svg?.map(
                            (svg, index) => (
                              <Menu.Item key={`svg_${index}`}>
                                <CardBuilderPitchSvg
                                  height={50}
                                  width={"auto"}
                                  pitch_string={svg}
                                />
                              </Menu.Item>
                            )
                          )}
                        </Menu.Dropdown>
                      </Menu>
                    )}
                </td>
                {expressionTerm.definition?.sentence && (
                  <td
                    suppressContentEditableWarning
                    style={{ textAlign: "left" }}
                  >
                    <Highlight
                      highlightColor="pink"
                      highlight={expressionTerm.userExpression}
                    >
                      {expressionTerm.definition.sentence}
                    </Highlight>
                  </td>
                )}
                <td style={{paddingRight: 30}}>
                  <ActionIcon
                    variant="subtle"
                    onClick={() => removeTerm(index)}
                  >
                    <IconX size="14" />
                  </ActionIcon>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ScrollArea.Autosize>
      <Card mt={20} ml={5} className={classes.card}>
        <Select
          label={<Text mb={10}>Deck</Text>}
          data={deckNames.map((deckName) => {
            return {
              label: deckName,
              value: deckName,
            };
          })}
          value={selectedDeckName}
          onChange={(deckName: string) => setSelectedDeckName(deckName)}
        ></Select>
        <Select
          label="Card Format"
          value={cardFormatModelName}
          data={cardFormats.map((cardFormat) => cardFormat.modelName)}
          onChange={(modelName: string) => setCardFormatModelName(modelName)}
        ></Select>
        <Button mt={20} fullWidth onClick={bulkAddToAnki}>
          Bulk Add
        </Button>
      </Card>
    </>
  );
}

export default CardBuilderPreview;
