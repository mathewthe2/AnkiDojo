import { ActionIcon, useMantineColorScheme } from '@mantine/core';
// import { HomeIcon } from '@modulz/radix-icons';
import { IconHome } from '@tabler/icons';
import Link from 'next/link';

export default function HomeButton() {
  const { colorScheme } = useMantineColorScheme();

  return (
    <Link href="/" passHref>
      <ActionIcon
        component="a"
        variant="transparent"
        size="xl"
        sx={(theme) => ({
          // backgroundColor:
          //   theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
          color: theme.colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.gray[2],
        })}
      >
        <IconHome width={20} height={20} />
      </ActionIcon>
    </Link>
  );
}
