import { Switch } from "@mantine/core";
import { useQuery } from "react-query";
import { AnkiSettingType, getEnableWordAudioSearch } from "@/lib/anki";
import useToggleEnableWordAudioSearch from "@/hooks/settings/ankiSettings/useToggleEnableWordAudioSearch";

function CardBuilderSettings() {
  const { data: enableWordAudioSearch, isLoading: isLoadingEnableWordSearch } =
  useQuery(AnkiSettingType.EnableWordAudioSearch, getEnableWordAudioSearch);

const toggleEnableSuspended = useToggleEnableWordAudioSearch(enableWordAudioSearch);

const handleEnableWordAudioSearch= async () => {
  toggleEnableSuspended.mutate();
};
    return <>
     <Switch
        disabled={isLoadingEnableWordSearch}
          checked={enableWordAudioSearch}
        onChange={handleEnableWordAudioSearch}
          label="Enable Word Audio Search"
        ></Switch></>
}

export default CardBuilderSettings;