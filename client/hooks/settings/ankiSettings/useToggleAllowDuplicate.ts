import { useMutation } from "react-query";
import { queryClient } from "pages/_app";
import { AnkiSettingType, setAllowDuplicate } from "@/lib/anki";

export default function useToggleAllowDuplicate(allowDuplicate: boolean) {
  return useMutation(() => setAllowDuplicate(!allowDuplicate), {
    onSuccess: () => {
      queryClient.invalidateQueries(AnkiSettingType.AllowDuplicate);
    },
  });
}
