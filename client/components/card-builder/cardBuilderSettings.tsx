import { Box, Card, Divider, Switch } from "@mantine/core";
import { useQuery } from "react-query";
import { AnkiSettingType, getAllowDuplicate, getEnableWordAudioSearch } from "@/lib/anki";
import useToggleEnableWordAudioSearch from "@/hooks/settings/ankiSettings/useToggleEnableWordAudioSearch";
import useToggleAllowDuplicate from "@/hooks/settings/ankiSettings/useToggleAllowDuplicate";

function CardBuilderSettings() {
  const { data: enableWordAudioSearch, isLoading: isLoadingEnableWordSearch } =
    useQuery(AnkiSettingType.EnableWordAudioSearch, getEnableWordAudioSearch);
    const { data: allowDuplicate, isLoading: isLoadingAllowDuplicate } =
    useQuery(AnkiSettingType.AllowDuplicate, getAllowDuplicate);

  const toggleEnableSuspended = useToggleEnableWordAudioSearch(
    enableWordAudioSearch
  );

  const toggleAllowDuplicate = useToggleAllowDuplicate(allowDuplicate);

  const handleEnableWordAudioSearch = async () => {
    toggleEnableSuspended.mutate();
  };

  const handleAllowDuplicate = async () => {
    toggleAllowDuplicate.mutate();
  };
  return (
    <>
      <Card>
        <Box pb={10}>
          <Switch
            disabled={isLoadingAllowDuplicate}
              checked={allowDuplicate}
            onChange={handleAllowDuplicate}
            label="Allow Duplicate"
          ></Switch>
        </Box>
        <Box pt={10}>
          <Switch
            disabled={isLoadingEnableWordSearch}
            checked={enableWordAudioSearch}
            onChange={handleEnableWordAudioSearch}
            label="Enable Word Audio Search"
          ></Switch>
        </Box>
      </Card>
    </>
  );
}

export default CardBuilderSettings;
