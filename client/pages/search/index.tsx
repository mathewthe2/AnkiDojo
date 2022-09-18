import { useEffect, useState } from "react";
import {
  Container,
  TextInput,
  Loader,
  Group,
  Drawer,
  Tabs,
  Button,
} from "@mantine/core";
import {
  IconSearch,
  IconSettings,
  IconPhoto,
  IconMessageCircle,
} from "@tabler/icons";
import { getNotes, SearchType } from "@/lib/search/notes";
import { useQuery } from "react-query";
import SearchResults from "@/components/search/searchResults";
import SearchSettings from "@/components/search/searchSettings";
import DictionaryResults from "@/components/search/dictionaryResults";

const DISPLAY_LOADER_DELAY = 1500;

function Search() {
  const [activeTab, setActiveTab] = useState<string | null>("anki");
  const [keyword, setKeyword] = useState("");
  const [isLongLoad, setIsLongLoad] = useState(false);
  const [opened, setOpened] = useState(false);
  const { data: noteData, isFetching: isLoadingNotes } = useQuery(
    [SearchType.Note, keyword],
    () => getNotes(keyword),
    { enabled: keyword.length > 0 }
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsLongLoad(isLoadingNotes);
    }, DISPLAY_LOADER_DELAY);
    return () => clearInterval(intervalId);
  }, [isLoadingNotes]);

  // const switchTabs = (tab: string | null) => {
  //   setActiveTab(tab);
  // };

  return (
    <Container fluid mt={30}>
      <Tabs value={activeTab} onTabChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="anki" icon={<IconPhoto size={14} />}>
            Anki
          </Tabs.Tab>
          <Tabs.Tab value="dictionary" icon={<IconMessageCircle size={14} />}>
            Dictionary
          </Tabs.Tab>
          <Group ml="auto" position="right">
            <Button
              leftIcon={<IconSettings size={18} />}
              variant="subtle"
              onClick={() => setOpened(true)}
            >
              Settings
            </Button>
          </Group>
        </Tabs.List>

        <Tabs.Panel value="anki" pt="xs">
          {/* Anki tab content */}
        </Tabs.Panel>

        <Tabs.Panel value="dictionary" pt="xs">
          {/* Dictionary tab content */}
        </Tabs.Panel>
      </Tabs>
      <TextInput
        autoFocus
        size="lg"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        styles={{
          input: {
            width: "100%",
            fontWeight: 700,
          },
        }}
        placeholder="Search"
        withAsterisk
        icon={isLongLoad ? <Loader size="sm" /> : <IconSearch size={24} />}
      />

      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="Search Setting"
        padding="xl"
        size="xl"
        position="right"
      >
        <SearchSettings />
      </Drawer>
      {activeTab === "anki" && (
        <SearchResults notes={noteData?.data || []} keyword={keyword} />
      )}
      {activeTab == "dictionary" && (
        <DictionaryResults keyword={keyword} />
      )}
    </Container>
  );
}

export default Search;
