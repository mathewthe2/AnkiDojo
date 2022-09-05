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
import DrillList from "@/components/drill/DrillList";

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
      <DrillList drills={data} />
    </Container>
  );
}

export default Drills;
