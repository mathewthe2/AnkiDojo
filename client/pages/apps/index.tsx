import { useEffect, useState } from "react";
import {
  Divider,
  Container,
  Text,
  UnstyledButton,
  Paper,
  Title,
  SimpleGrid,
} from "@mantine/core";
import ActionsGrid from "@/components/apps/actionsGrid";
import Link from "next/link";
import { getUserApps } from "@/lib/apps";
import UserAppInterface from "@/interfaces/apps/UserAppInterface";

function Apps() {

  const [userApps, setUserApps] = useState<UserAppInterface[]>([]);

  useEffect(() => {
    getUserApps().then((apps) => setUserApps(apps));
  }, []);

  return (
    <Container pt={20}>
      <ActionsGrid />
      <Divider mb={20} />
      {/* <AppsGrid/> */}
      <Title order={3}>Apps</Title>
      <Paper shadow="xs" p="md">
        <SimpleGrid cols={3}>
          {userApps.map(userApp=>(
          <Link href={`/apps/${userApp.id}`} passHref>
            <UnstyledButton>{userApp.title}</UnstyledButton>
          </Link>
          ))}
          {/* <Link href="/apps/template" passHref>
            <UnstyledButton>Template</UnstyledButton>
          </Link>
          <div>Conjugation Drill</div>
          <div>Conjugation Drill</div> */}
        </SimpleGrid>
      </Paper>
    </Container>
  );
}

export default Apps;
