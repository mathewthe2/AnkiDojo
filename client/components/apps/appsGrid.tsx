import { useEffect, useState } from "react";
import {
  Text,
  Image,
  Center,
  Stack,
  UnstyledButton,
  Paper,
  Title,
  SimpleGrid,
} from "@mantine/core";
import Link from "next/link";
import { getUserApps, getAppIconUrl } from "@/lib/apps";
import UserAppInterface from "@/interfaces/apps/UserAppInterface";

function AppsGrid() {
    const [userApps, setUserApps] = useState<UserAppInterface[]>([]);

    useEffect(() => {
      getUserApps().then((apps) => setUserApps(apps));
    }, []);

    return (
        <>
        <Title order={3}>Apps</Title>
        <Paper shadow="xs" p="md">
          <SimpleGrid cols={3}>
            {userApps.map((userApp) => (
              <Paper>
                <Link href={`/apps/${userApp.id}`} passHref>
                  <UnstyledButton>
                    <Center>
                    <Stack>
                    <Image width={100} height={75} src={getAppIconUrl(userApp)} />
                    <Text style={{wordWrap: 'break-word', maxWidth: 200}}>{userApp.title}</Text>
                    </Stack>
                    </Center>
                  </UnstyledButton>
                </Link>
              </Paper>
            ))}
          </SimpleGrid>
        </Paper>
        </>
    )
}

export default AppsGrid