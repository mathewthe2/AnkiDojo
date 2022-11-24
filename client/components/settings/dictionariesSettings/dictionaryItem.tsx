import {
    Text,
    Card,
    createStyles,
  } from "@mantine/core";

const useStyles = createStyles((theme) => ({
    title: {
      fontFamily: `Greycliff CF, ${theme.fontFamily}`,
      fontWeight: 700,
    },
    card: {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  }));

function DictionaryItem() {
    const { classes, theme } = useStyles();
    return (
        <Card className={classes.card}>
        <Text>JMDict</Text>
      </Card>
    )
}

export default DictionaryItem;
