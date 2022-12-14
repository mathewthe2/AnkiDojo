import {
  Text,
  Image,
  Tabs,
  UnstyledButton,
  Card,
  SimpleGrid,
  createStyles,
} from "@mantine/core";
import { useQuery } from "react-query";
import { IconUser, IconMessageCircle } from "@tabler/icons";
import Link from "next/link";
import { getUserApps, getAppIconUrl } from "@/lib/apps";
import CommunityApps from "./communityApps";

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontWeight: 700,
  },

  item: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    borderRadius: theme.radius.md,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    transition: "box-shadow 150ms ease, transform 100ms ease",

    "&:hover": {
      boxShadow: `${theme.shadows.md} !important`,
      transform: "scale(1.05)",
    },
  },
}));

function AppsGrid() {
  const { classes, theme } = useStyles();
  const { data: userApps, isLoading } = useQuery("user-apps", getUserApps);

  return (
    <>
      {/* <Title order={3}>Apps</Title> */}
      <Tabs defaultValue="myApps">
        <Tabs.List>
          <Tabs.Tab value="myApps" icon={<IconUser size={14} />}>
            My Apps
          </Tabs.Tab>
          <Tabs.Tab
            value="communityApps"
            icon={<IconMessageCircle size={14} />}
          >
            Community Apps
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="myApps" pt="xs">
          <Card shadow="xs" p="md" className={classes.card}>
            <SimpleGrid cols={5} mt="md">
              {userApps &&
                userApps.map((userApp) => (
                  <Link key={userApp.id} href={`/apps/${userApp.id}`} passHref>
                    <UnstyledButton>
                      <Card style={{ minHeight: 200 }} className={classes.item}>
                        <Card.Section>
                          <Image
                            width={150}
                            height={100}
                            src={getAppIconUrl(userApp)}
                            style={{
                              marginLeft: "auto",
                              marginRight: "auto",
                            }}
                          />
                        </Card.Section>
                        <Text
                          weight={500}
                          size="lg"
                          mt="md"
                          style={{ textAlign: "center" }}
                        >
                          {userApp.title}
                        </Text>
                        <Text
                          mt="xs"
                          color="dimmed"
                          size="sm"
                          style={{ textAlign: "center" }}
                        >
                          {userApp.description}
                        </Text>
                      </Card>
                    </UnstyledButton>
                  </Link>
                ))}
            </SimpleGrid>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="communityApps" pt="xs">
          <CommunityApps />
        </Tabs.Panel>
      </Tabs>
    </>
  );
}

export default AppsGrid;
