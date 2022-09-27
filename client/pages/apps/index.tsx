import {
  Divider,
  Container,
} from "@mantine/core";
import ActionsGrid from "@/components/apps/actionsGrid";
import AppsGrid from "@/components/apps/appsGrid";

function Apps() {

  return (
    <Container fluid pt={42}>
      {/* <ActionsGrid />
      <Divider mb={20} /> */}
      <AppsGrid/>
    </Container>
  );
}

export default Apps;
