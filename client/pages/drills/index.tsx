import {
  Group,
  Button,
  Text,
  Container,
  ActionIcon,
  Paper,
} from "@mantine/core";
import { IconPlus, IconDotsVertical, IconDots } from "@tabler/icons";
import Link from "next/link";
import { DrillType } from "@/interfaces/drill/DrillType";

const data = [
  {
    id: "hundreds_and_thousands",
    title: "Hundreds & Thousands",
    defaultType: DrillType.Audio,
    description: "",
    tags: [],
  },
  {
    id: "planets",
    title: "Planets",
    defaultType: DrillType.Reading,
    description: "",
    tags: [],
  },
];

function Drills() {
  return (
    <Container mt={20}>
      {/* <Title mb={20}>Drills</Title> */}
      <Button leftIcon={<IconPlus size={14} />} variant="filled" mb={20}>
        Create Drill
      </Button>
      {data.map((drill) => (
        <>
          <Paper shadow="md" p="md" mb={10}>
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
          </Paper>
        </>
      ))}
    </Container>
  );
}

export default Drills;
