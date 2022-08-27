import { ActionIcon, Box, useMantineColorScheme } from '@mantine/core';
import { IconSettings } from '@tabler/icons';
import { useRouter } from 'next/router';

export default function SettingsButton() {
  const { colorScheme } = useMantineColorScheme();
  const router = useRouter();

  return (
    <Box>
      <ActionIcon
        variant="transparent"
        onClick={() => console.log('settings')}
        size="xl"
        sx={(theme) => ({
          // backgroundColor:
          //   theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
          color: theme.colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.gray[2],
        })}
      >
          <IconSettings width={20} height={20} />
      </ActionIcon>
    </Box>
  );
}
