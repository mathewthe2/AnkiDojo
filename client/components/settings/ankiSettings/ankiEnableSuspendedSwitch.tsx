import { Switch } from "@mantine/core";
import { useQuery } from "react-query";
import useToggleEnableSuspended from "@/hooks/settings/ankiSettings/useToggleEnableSuspended";
import { AnkiSettingType, getEnableSuspended } from "@/lib/anki";

function AnkiEnableSuspendedSwitch() {
  const { data: enableSuspended, isLoading: isLoadingEnableSuspended } =
    useQuery(AnkiSettingType.EnableSuspended, getEnableSuspended);

  const toggleEnableSuspended = useToggleEnableSuspended(enableSuspended);

  const handleEnableSuspended = async () => {
    toggleEnableSuspended.mutate();
  };

  return (
    <>
      {!isLoadingEnableSuspended && (
        <Switch
          disabled={isLoadingEnableSuspended}
          checked={enableSuspended}
          onChange={handleEnableSuspended}
          label="Enable Suspended"
        ></Switch>
      )}
    </>
  );
}

export default AnkiEnableSuspendedSwitch;
