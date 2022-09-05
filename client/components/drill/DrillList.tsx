import {
  ScrollArea,
  Card,
  UnstyledButton,
  Text,
  createStyles,
} from "@mantine/core";
import Link from "next/link";

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    padding: 20,
    marginTop: 10,
    transition: "box-shadow 150ms ease, transform 150ms ease",
    cursor: "pointer",

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

function DrillList({ drills }: { drills: any }) {
  const { classes, theme } = useStyles();
  return (
    <ScrollArea type="auto" mt={10} style={{ height: 350, width: "100%" }}>
      {drills.map((drill: any) => (
        <Link
          href={`/drills/${drill.id}/session?type=${drill.defaultType}`}
          passHref
        >
          <Card component="a" shadow="md" key={drill.id} className={classes.card}>
            <Text>{drill.title}</Text>
          </Card>
        </Link>
      ))}
    </ScrollArea>
  );
}
{
  /* <Paper shadow="md" p="md" mb={10}>
            <Group position="apart">
              <Text weight={700}>{drill.title}</Text>
              <Group>
                <Link
                  href={`/drills/${drill.id}/session?type=${drill.defaultType}`}
                  passHref
                >
                  <Button component="a" variant="light">Start</Button>
                </Link>
                <ActionIcon>
                  <IconDotsVertical size={18} />
                </ActionIcon>
              </Group>
            </Group>
          </Paper> */
}

export default DrillList;
