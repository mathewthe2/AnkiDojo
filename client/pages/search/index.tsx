import { useEffect, useState } from "react";
import { Container, TextInput, Loader, Group, Grid, Button } from "@mantine/core";
import { IconSearch, IconSettings } from "@tabler/icons";
import { getNotes, SearchType } from "@/lib/search/notes";
import { useQuery } from "react-query";
import SearchResults from "@/components/search/searchResults";

const DISPLAY_LOADER_DELAY = 1500;

function Search() {
  const [keyword, setKeyword] = useState("");
  const [isLongLoad, setIsLongLoad] = useState(false);
  const { data: noteData, isFetching: isLoadingNotes } = useQuery(
    [SearchType.Note, keyword],
    () => getNotes(keyword),
    {enabled: keyword.length > 0}
  );

  useEffect(()=>{
    const intervalId = setInterval(() => {
      setIsLongLoad(isLoadingNotes);
    }, DISPLAY_LOADER_DELAY);
    return () => clearInterval(intervalId);
  }, [isLoadingNotes])

  return (
    <Container mt={50}>
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
      <Group mt={10} position="right">
      <Button  leftIcon={<IconSettings size={18} />} variant="light" >Settings</Button>
      </Group>
      <SearchResults notes={noteData?.data || []} keyword={keyword} />
    </Container>
  );
}

export default Search;
