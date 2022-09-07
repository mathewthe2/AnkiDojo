import { useEffect, useState } from "react";
import {
  Box,
  Menu,
  Text,
  ScrollArea,
  Card,
  createStyles,
  Center,
  Button,
  Select,
  Paper,
  Table,
  ActionIcon,
  UnstyledButton,
} from "@mantine/core";
import CardBuilderPreviewProps from "@/interfaces/card_builder/CardBuilderPreviewProps";
import { getTermDefinitions, Definition } from "@/lib/japanese";
import { getDeckNames, getPrimaryDeck, getCardFormats } from "@/lib/anki";
import { IconX } from "@tabler/icons";
import AnkiCardFormat from "@/interfaces/anki/ankiCardFormat";
import CardBuilderPitchSvg from "./cardBuilderPitchSvg";

interface ExpressionTerm {
  userExpression: string;
  definition: Definition;
}

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
          : theme.colors.dark[6],
    },
  },
}));

function CardBuilderPreview({ expressionList }: CardBuilderPreviewProps) {
  const [deckNames, setDeckNames] = useState([]);
  const [primaryDeck, setPrimaryDeck] = useState("");
  const [cardFormatModelName, setCardFormatModelName] = useState("");
  const [cardFormats, setCardFormats] = useState<AnkiCardFormat[]>([]);
  const [expressionTerms, setExpressionTerms] = useState<ExpressionTerm[]>([]);
  const { classes, theme } = useStyles();

  useEffect(() => {
    getDeckNames().then((deckNames) => setDeckNames(deckNames.sort()));
    getPrimaryDeck().then((primaryDeck) => setPrimaryDeck(primaryDeck));
    getCardFormats().then((cardFormats) => {
      setCardFormats(cardFormats);
      if (cardFormats.length > 0) {
        setCardFormatModelName(cardFormats[0].modelName);
      }
    });
    getTermDefinitions(expressionList).then((definitions) => {
      if (expressionList.length === definitions.length) {
        setExpressionTerms(
          expressionList.map((expression, index) => {
            return {
              userExpression: expression,
              definition: definitions[index],
            };
          })
        );
      }
    });
  }, []);

  const updateTextOfTermDefinitions = (index: number, newValue: string) => {
    // expressionTerms[index]
  };

  return (
    <>
      <ScrollArea.Autosize maxHeight={500} style={{ width: "100%" }} mx="auto">
        <Table striped mb={10} ml={5}>
          <thead>
            <tr style={{ marginLeft: 5 }}>
              <th style={{ textAlign: "center" }}>Expression</th>
              <th style={{ textAlign: "center" }}>Reading</th>
              <th style={{ textAlign: "center" }}>Glossary</th>
              <th style={{ textAlign: "center" }}>Pitch</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {expressionTerms.map((expressionTerm, index) => (
              <tr key={`expression_${index}`}>
                <td
                  suppressContentEditableWarning
                  contentEditable
                  onInput={(e) => console.log(e.currentTarget.textContent)}
                  style={{ textAlign: "center", fontSize: "24px" }}
                >
                  {expressionTerm.definition.expression}
                </td>
                <td
                  suppressContentEditableWarning
                  contentEditable
                  style={{ textAlign: "center", fontSize: "24px" }}
                >
                  {expressionTerm.definition.reading}
                </td>
                <td
                  suppressContentEditableWarning
                  style={{ textAlign: "center" }}
                  contentEditable={
                    expressionTerm.definition.glossary.length == 1
                  }
                >
                  {expressionTerm.definition.glossary.length === 1 &&
                    expressionTerm.definition.glossary[0]}
                  {expressionTerm.definition.glossary.length > 1 && (
                    <Select
                      searchable
                      creatable
                      getCreateLabel={(query) => `+ Use glossary: ${query}`}
                      defaultValue={expressionTerm.definition.glossary[0]}
                      data={expressionTerm.definition.glossary}
                    ></Select>
                  )}
                </td>
                <td style={{ margin: "0 auto" }}>
                  {expressionTerm.definition.pitch_svg.length > 0 && (
                    <Menu shadow="md" width={200}>
                      <Menu.Target>
                        <UnstyledButton
                          className={classes.pitchButton}
                          >
                          <CardBuilderPitchSvg
                            height={50}
                            width={"auto"}
                            pitch_string={
                              expressionTerm.definition.pitch_svg[0]
                            }
                          />
                        </UnstyledButton>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Label>Pitch Accents</Menu.Label>
                        {expressionTerm.definition.pitch_svg.map(
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
                <td>
                  <ActionIcon variant="subtle">
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
          value={primaryDeck}
          onChange={(primaryDeck: string) => setPrimaryDeck(primaryDeck)}
        ></Select>
        <Select
          label="Card Format"
          value={cardFormatModelName}
          data={cardFormats.map((cardFormat) => cardFormat.modelName)}
        ></Select>
        <Button mt={20} fullWidth>
          Bulk Add
        </Button>
      </Card>
    </>
  );
}

export default CardBuilderPreview;
