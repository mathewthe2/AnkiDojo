import { Container, Title } from "@mantine/core";
import CardBuilderForm from "@/components/card-builder/cardBuilderForm";

function CardBuilder() {
  return (
    <Container fluid mt={15}>
      <Title mb={20}>Card Builder</Title>
      <CardBuilderForm />
    </Container>
  );
}

export default CardBuilder;
