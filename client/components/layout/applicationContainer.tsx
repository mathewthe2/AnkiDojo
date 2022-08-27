import { AppShell, Header, Text } from '@mantine/core';
import Navigation from './navigation';
import HeaderItem from './headerItem';

function ApplicationContainer({ children }: React.PropsWithChildren<{}>) {
  return (
    <AppShell
      padding={0}
      fixed
      navbar={<Navigation/>}
      header={<Header height={60} p="xs"><HeaderItem/></Header>}
      styles={(theme) => ({
        main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
      })}
    >
      <>
     {children}
     </>
    </AppShell>
  );
}

export default ApplicationContainer