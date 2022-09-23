import {
  Divider,
  Container,
} from "@mantine/core";
import ActionsGrid from "@/components/apps/actionsGrid";
import AppsGrid from "@/components/apps/appsGrid";

function Apps() {

  return (
    <Container fluid pt={20}>
      {/* <ActionsGrid />
      <Divider mb={20} /> */}
      <AppsGrid/>
    </Container>
  );
}

export default Apps;
