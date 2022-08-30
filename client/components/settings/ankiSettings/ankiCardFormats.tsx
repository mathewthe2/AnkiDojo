import { Box, Card, Text, ScrollArea, UnstyledButton } from "@mantine/core";
import { createStyles } from "@mantine/core";

// const data = ["Basic", "Anime"];
const data = new Array(2).fill('Basic');

const useStyles = createStyles((theme) => ({
  paper: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    padding: 20,
    marginTop: 10,
    transition: "box-shadow 150ms ease, transform 150ms ease",

    "&:hover": {
      boxShadow: `${theme.shadows.md} !important`,
      transform: "translate(20px);",
    },
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontWeight: 700,
  },
}));
function AnkiCardFormats() {
  const { classes, theme } = useStyles();
  return (
    <ScrollArea mt={10} style={{height: 500}}>
      {data.map((cardFormat) => (
        <Card shadow="md" key={cardFormat} className={classes.paper}>
          <UnstyledButton style={{width: '100%'}}>
          <Text>{cardFormat}</Text>
          </UnstyledButton>
        </Card>
      ))}
    </ScrollArea>
  );
}

export default AnkiCardFormats;
