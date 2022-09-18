import { Container, Textarea, Select } from "@mantine/core";
import CardBuilderForm from "@/components/card-builder/cardBuilderForm";

function CardBuilder() {
  return (
    <Container fluid  mt={30}>
        <CardBuilderForm/>
    </Container>
  );
}

export default CardBuilder;
