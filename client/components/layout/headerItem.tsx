import { Box, Group, Text } from "@mantine/core";
import { IconSun, IconMoonStars } from "@tabler/icons";
import { ActionIcon, useMantineColorScheme } from "@mantine/core";

function HeaderItem() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  return (
    <Box
    sx={(theme) => ({
      paddingLeft: theme.spacing.xs,
      paddingRight: theme.spacing.xs,
      paddingBottom: theme.spacing.lg,
      borderBottom: `1px solid ${
        theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
      }`,
    })}
  >
    <Group sx={{ height: "100%" }} position="apart">
      {/* <Logo colorScheme={colorScheme} /> */}
      <Text size="xl">Anki Dojo</Text>
      <ActionIcon
        variant="default"
        onClick={() => toggleColorScheme()}
        size={30}
      >
        {colorScheme === "dark" ? (
          <IconSun size={16} />
        ) : (
          <IconMoonStars size={16} />
        )}
      </ActionIcon>
    </Group>
    </Box>
  );
}

export default HeaderItem;
