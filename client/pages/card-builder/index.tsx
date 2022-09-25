import { Container, Title } from "@mantine/core";
import CardBuilderForm from "@/components/card-builder/cardBuilderForm";

function CardBuilder() {
  return (
    <Container fluid mt={15}>
      <CardBuilderForm />
    </Container>
  );
}

export default CardBuilder;
