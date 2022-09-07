import { Container, Textarea, Select } from "@mantine/core";
import CardBuilderForm from "@/components/card-builder/cardBuilderForm";

function CardBuilder() {
  return (
    <Container mt={30}>
        <CardBuilderForm/>
    </Container>
  );
}

export default CardBuilder;
