import { useMutation } from "react-query";
import { queryClient } from "pages/_app";
import { AnkiSettingType, setEnableWordAudioSearch } from "@/lib/anki";

export default function useToggleEnableWordAudioSearch(enableWordAudioSearch: boolean) {
  return useMutation(() => setEnableWordAudioSearch(!enableWordAudioSearch), {
    onSuccess: () => {
      queryClient.invalidateQueries(AnkiSettingType.EnableWordAudioSearch);
    },
  });
}
