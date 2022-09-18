import { useState, useEffect } from "react";
import { Card, SimpleGrid, UnstyledButton, Text, Image, createStyles } from "@mantine/core"
import UserAppInterface from "@/interfaces/apps/UserAppInterface";
import Link from "next/link";
import { getCommunityApps } from "@/lib/apps";

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

function CommunityApps() {
    const { classes, theme } = useStyles();
    const [communityApps, setCommunityApps] = useState<UserAppInterface[]>([])
    useEffect(() => {
        getCommunityApps().then((apps) => setCommunityApps(apps));
      }, []);
return (
    <Card shadow="xs" p="md" className={classes.card}>
        <SimpleGrid cols={3} mt="md">
          {communityApps.map((communityApp) => (
            <Link key={communityApp.id} href={`/community-apps/${communityApp.id}`} passHref>
              <UnstyledButton>
                <Card style={{ minHeight: 300 }} className={classes.item}>
                  <Card.Section>
                    <Image
                      width={300}
                      height={150}
                      src={communityApp.icon}
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
                    {communityApp.title}
                  </Text>
                  <Text
                    mt="xs"
                    color="dimmed"
                    size="sm"
                    style={{ textAlign: "center" }}
                  >
                    {communityApp.description}
                  </Text>
                </Card>
              </UnstyledButton>
            </Link>
          ))}
        </SimpleGrid>
      </Card>
)
}

export default CommunityApps