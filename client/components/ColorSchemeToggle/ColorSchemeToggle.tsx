import { ActionIcon, Box, useMantineColorScheme } from '@mantine/core';
// import { SunIcon, MoonIcon } from '@modulz/radix-icons';
import { IconSun, IconMoonStars } from "@tabler/icons";

export default function ColorSchemeToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Box>
      <ActionIcon
        variant="transparent"
        onClick={() => toggleColorScheme()}
        size="xl"
        sx={(theme) => ({
          // backgroundColor:
          //   theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
          color: theme.colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.gray[2],
        })}
      >
        {colorScheme === 'dark' ? (
          <IconSun width={20} height={20} />
        ) : (
          <IconMoonStars width={20} height={20} />
        )}
      </ActionIcon>
    </Box>
  );
}
