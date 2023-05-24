import { useEffect, useState } from "react";
import {
  Anchor,
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
import { getExpressionForAnki, getGlossaryBriefForAnki, getGlossaryForAnki, getSentenceForAnki, getSentenceTranslationForAnki, getTermDefinitions } from "@/lib/japanese";
import {
  getDeckNames,
  getPrimaryDeck,
  getCardFormats,
  FieldValueType,
} from "@/lib/anki";
import { Howl } from "howler";
import { addNotesToAnki, hasMecabSupport } from "@/lib/card-builder/notes";
import NoteAddInterface from "@/interfaces/card_builder/NoteAddInterface";
import { IconVolume, IconX, IconEye, IconEyeOff } from "@tabler/icons";
import AnkiCardFormat from "@/interfaces/anki/ankiCardFormat";
import CardBuilderPitchSvg from "./cardBuilderPitchSvg";
import ExpressionTerm from "@/interfaces/card_builder/ExpressionTerm";
import { NoteMedia } from "@/interfaces/card_builder/NoteMedia";
import { AudioUrl, Definition } from "@/lib/japanese";
import { MorphState, addMorphs, removeMorphs } from "@/lib/morphs";
import CardBuilderResult from "./cardBuilderResult";
import NoteResult from "@/interfaces/card_builder/NoteResultInterface";

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
  knownVocabSelect: {
    input: {
      border: "transparent",
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[3]
          : theme.colors.gray[4],
    },
  },
}));

const VOCAB_LIMIT_FOR_AUDIO = 120; // prevent crashing from massive audio scraping
const EXPRESSON_KEYS_FOR_FIELDS_TO_COMBINE = [
  "sentences",
  "sentence_translations",
];
const EXPRESSON_KEYS_FOR_FIELDS_TO_KEEP = [
  "expression",
  "glossary",
  "selectedGlossary",
  "reading",
];

function CardBuilderPreview({
  expressionList,
  passages,
  onSuccessCallback,
}: {
  expressionList: ExpressionTerm[];
  passages?: string[];
  onSuccessCallback?: Function;
}) {
  const [deckNames, setDeckNames] = useState([]);
  const [mecabMissing, setMecabMissing] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [noteResult, setNoteResult] = useState<NoteResult>();
  const [noteResultExpressionKey, setNoteResultExpressionKey] = useState("");
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

  const requiresMecabSupport = async () => {
    if (passages && passages.length > 0) {
      const hasMecab = await hasMecabSupport();
      return !hasMecab;
    } else {
      return false;
    }
  };

  useEffect(() => {
    requiresMecabSupport().then((requiresMecabSupport) => {
      setMecabMissing(requiresMecabSupport);
      if (requiresMecabSupport) {
        setIsLoaded(true);
        return;
      }
      // no need for mecab and has mecab installed
      getDeckNames().then((deckNames) => setDeckNames(deckNames.sort()));
      getPrimaryDeck().then((primaryDeck) => setSelectedDeckName(primaryDeck));
      getCardFormats().then((cardFormats) => {
        setCardFormats(cardFormats);
        if (cardFormats.length > 0) {
          setCardFormatModelName(cardFormats[0].modelName);
        }
      });

      getTermDefinitions({
        keywords: expressionList.map(
          (expression: ExpressionTerm) => expression.userExpression
        ),
        passages: passages,
        include_audio_urls:
          expressionList.length > VOCAB_LIMIT_FOR_AUDIO ? false : undefined,
      }).then((definitions) => {
        if (!isLoaded) {
          const expressionTerms: ExpressionTerm[] = definitions.map(
            (definition: Definition, index: number) => {
              // add sentences if expression has sentences, eg. import json / kindle vocab
              const onlyUserExpression =
                expressionList.length === definitions.length;

              const useExistingIfNotEmpty = <U extends keyof Definition>(
                dictionaryKey: U
              ) => {
                if (
                  onlyUserExpression &&
                  expressionList[index]?.definition?.[dictionaryKey]
                ) {
                  const val =
                    expressionList[index]?.definition?.[dictionaryKey];
                  const isValidString =
                    typeof val === "string" && val.length > 0;
                  const isValidArray = Array.isArray(val) && val.length > 0;
                  if (isValidString || isValidArray) {
                    definition[dictionaryKey] =
                      expressionList[index]?.definition?.[dictionaryKey];
                  }
                }
              };

              const combineExistingArrays = <U extends keyof Definition>(
                dictionaryKey: U
              ) => {
                if (
                  onlyUserExpression &&
                  expressionList[index]?.definition?.[dictionaryKey]?.[0]
                ) {
                  definition[dictionaryKey] = [
                    ...((definition[dictionaryKey] as string[]) || []),
                    ...((expressionList[index]?.definition?.[
                      dictionaryKey
                    ] as string[]) || []),
                  ] as Definition[U];
                }
              };

              EXPRESSON_KEYS_FOR_FIELDS_TO_KEEP.forEach((key: string) => {
                useExistingIfNotEmpty(key as keyof Definition);
              });

              EXPRESSON_KEYS_FOR_FIELDS_TO_COMBINE.forEach((key: string) => {
                combineExistingArrays(key as keyof Definition);
              });

              // console.log("gloss", definition?.selectedGlossary);

              if (definition.sentences && definition.sentences.length > 0) {
                setHasSentences(true);
              }
              if (expressionList[index]?.definition?.audio_urls?.[0]) {
                definition.audio_urls = [
                  ...(expressionList[index]?.definition?.audio_urls || []),
                  ...(definition.audio_urls || []),
                ];
              }
              return {
                userExpression: definition.surface || "",
                definition: definition,
              };
            }
          );
          setExpressionTerms(expressionTerms);
        }
        setIsLoaded(true);
      });
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
        expressionTerm.definition?.audio_urls?.[0]?.url ||
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

  const bulkAddToAnki = async () => {
    const modelMap = cardFormats.find(
      (cardFormat) => cardFormat.modelName === cardFormatModelName
    )?.modelMap;
    let expressionKey = '';
    // map fields to corresponding names in card format
    const fieldMaps: Map<string, string>[] = [];
    const audioList: NoteMedia[] = [];
    expressionTerms
      .filter((expressionTerm) => !isTermKnown(expressionTerm))
      .forEach((expressionTerm, index) => {
        const fieldMap = new Map<string, string>();
        modelMap?.forEach((value: string, key: string) => {
          switch (value) {
            case FieldValueType.Expression:
              fieldMap.set(
                key,
                getExpressionForAnki(expressionTerm.definition)
              );
              expressionKey = key;
              break;
            case FieldValueType.Reading:
              fieldMap.set(key, expressionTerm.definition?.reading || "");
              break;
            case FieldValueType.Glossary:
              fieldMap.set(
                key,
                getGlossaryForAnki(expressionTerm?.definition)
              );
              break;
            case FieldValueType.GlossaryBrief:
              fieldMap.set(
                key,
                getGlossaryBriefForAnki(expressionTerm?.definition)
              );
              break;
            case FieldValueType.PitchAccent:
              fieldMap.set(
                key,
                expressionTerm.definition?.pitch_svg?.[0] || ""
              ); // TODO: change selected pitch
              break;
            case FieldValueType.Sentence:
              fieldMap.set(
                key,
                getSentenceForAnki(expressionTerm?.definition)
              );
              break;
            case FieldValueType.SentenceTranslation:
              fieldMap.set(
                key,
                getSentenceTranslationForAnki(expressionTerm?.definition)
              );
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
    const addNotesResult = await addNotesToAnki(notesToAdd);
    setNoteResult(addNotesResult);
    setNoteResultExpressionKey(expressionKey);
    setHasResult(true);
    // if (onSuccessCallback) {
    //   onSuccessCallback();
    // }
  };

  const isTermKnown = (term: ExpressionTerm) =>
    term.definition?.morph_state === MorphState.KNOWN;

  const hasAudioUrls = (term: ExpressionTerm) =>
    term.definition?.audio_urls != null &&
    term.definition?.audio_urls.length > 0;

  const toggleKnownVocab = (index: number) => {
    const morphState = isTermKnown(expressionTerms[index])
      ? ""
      : MorphState.KNOWN;
    setExpressionTerms(
      [...expressionTerms].map((term, termIndex) => {
        if (termIndex === index) {
          return {
            ...term,
            definition: { ...term.definition, morph_state: morphState },
          };
        } else {
          return term;
        }
      }) as ExpressionTerm[]
    );
    const morph =
      expressionTerms[index].definition?.expression ||
      expressionTerms[index].definition?.surface ||
      null;
    if (morph) {
      if (morphState === MorphState.KNOWN) {
        addMorphs(MorphState.KNOWN, [morph]);
      } else {
        removeMorphs(MorphState.KNOWN, [morph]);
      }
    }
  };

  const numberOfKnownWords = () =>
    expressionTerms.filter(
      (term) => term.definition?.morph_state == MorphState.KNOWN
    ).length;

  const numberOfUnknownWords = () =>
    expressionTerms.length - numberOfKnownWords();

  const KnownVocabColor =
    theme.colorScheme === "dark" ? theme.colors.dark[3] : theme.colors.gray[4];

  if (!isLoaded) {
    return <Skeleton height={400} />;
  } else if (mecabMissing) {
    return (
      <Center>
        <Text style={{ textAlign: "center" }}>
          Mecab Support Addon is missing.
          <br />
          Please install{" "}
          <Anchor
            href="https://github.com/ianki/MecabUnidic/releases/download/v3.1.0/MecabUnidic3.1.0.ankiaddon"
            target="_blank"
          >
            Mecab Support
          </Anchor>{" "}
          and relaunch Anki.
        </Text>
      </Center>
    );
  } else if (expressionTerms.length === 0) {
    return <Center>No words added!</Center>;
  }

  if (hasResult) {
    return <CardBuilderResult noteResult={noteResult} expressionKey={noteResultExpressionKey} onSuccessCallback={onSuccessCallback} />
  }

  return (
    <>
      <Title color="dimmed" order={5} style={{ textAlign: "center" }}>
        {`${numberOfUnknownWords()} of ${expressionTerms.length} new ${expressionTerms.length === 1 ? "word" : "words"
          }`}
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {expressionTerms.map((expressionTerm, index) => {
              const isKnownVocab = isTermKnown(expressionTerm);
              const hasAudio = hasAudioUrls(expressionTerm);
              return (
                <tr
                  key={`expression_${index}`}
                  style={{
                    background:
                      expressionTerm.definition?.morph_state ===
                        MorphState.KNOWN
                        ? KnownVocabColor
                        : "inherit",
                  }}
                >
                  <td style={{ maxWidth: 20 }}>
                    {hasAudio && (
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
                                expressionTerm.definition?.selectedAudioUrl ||
                                expressionTerm.definition?.audio_urls?.[0]
                                  .url ||
                                ""
                              )
                            }
                          >
                            <IconVolume size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown
                          style={{
                            background:
                              theme.colorScheme === "dark"
                                ? theme.colors.dark[7]
                                : "white",
                          }}
                        >
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
                                    expressionTerm.definition
                                      ?.selectedAudioUrl
                                    : audioIndex === 0
                                }
                              />
                            )
                          )}
                        </Menu.Dropdown>
                      </Menu>
                    )}
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
                      fontSize: "18px",
                      minWidth: 100,
                    }}
                  >
                    {expressionTerm.definition?.expression ||
                      expressionTerm.definition?.surface}
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
                          className={
                            isKnownVocab ? classes.knownVocabSelect : ""
                          }
                          searchable
                          creatable
                          getCreateLabel={(query) => `+ Use glossary: ${query}`}
                          onCreate={(query) => {
                            // this will override onchange
                            addGlossaryTerm(index, query);
                            return query;
                          }}
                          defaultValue={
                            expressionTerm.definition?.glossary?.[0]
                          }
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
                      expressionTerm.definition.pitch_svg.length > 0 &&
                      (expressionTerm.definition.pitch_svg.length === 1 ? (
                        <CardBuilderPitchSvg
                          height={50}
                          width={"auto"}
                          pitch_string={
                            expressionTerm.definition?.pitch_svg?.[0] || ""
                          }
                        />
                      ) : (
                        <Menu shadow="md" width={200} withinPortal>
                          <Menu.Target>
                            <UnstyledButton className={classes.pitchButton}>
                              <CardBuilderPitchSvg
                                height={50}
                                width={"auto"}
                                pitch_string={
                                  expressionTerm.definition?.pitch_svg?.[0] ||
                                  ""
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
                      ))}
                  </td>
                  {expressionTerm.definition?.sentences?.[0] && (
                    <td
                      suppressContentEditableWarning
                      style={{ textAlign: "left" }}
                    >
                      <Highlight
                        highlightColor="pink"
                        highlight={expressionTerm.definition.surface || ""}
                      >
                        {expressionTerm.definition.sentences[0]}
                      </Highlight>
                      {expressionTerm.definition
                        ?.sentence_translations?.[0] && (
                          <Text style={{ fontStyle: "italic" }}>
                            {expressionTerm.definition.sentence_translations[0]}
                          </Text>
                        )}
                    </td>
                  )}
                  {/* no sentences for this expression but has sentences for others */}
                  {expressionTerm.definition?.sentences?.length === 0 &&
                    hasSentences && <td></td>}
                  <td>
                    <ActionIcon
                      variant="subtle"
                      onClick={() => toggleKnownVocab(index)}
                    >
                      {isKnownVocab ? (
                        <IconEyeOff size="14" />
                      ) : (
                        <IconEye size="14" />
                      )}
                    </ActionIcon>
                  </td>
                  <td style={{ paddingRight: 30 }}>
                    <ActionIcon
                      variant="subtle"
                      onClick={() => removeTerm(index)}
                    >
                      <IconX size="14" />
                    </ActionIcon>
                  </td>
                </tr>
              );
            })}
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
          Bulk Add ({numberOfUnknownWords()})
        </Button>
      </Card>
    </>
  );
}

export default CardBuilderPreview;
