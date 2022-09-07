import { useMutation } from "react-query";
import { queryClient } from "pages/_app";
import { AnkiSettingType, setEnableSuspended } from "@/lib/anki";

export default function useToggleEnableSuspended(enableSuspended: boolean) {
  return useMutation(() => setEnableSuspended(!enableSuspended), {
    onSuccess: () => {
      queryClient.invalidateQueries(AnkiSettingType.EnableSuspended);
    },
  });
}
