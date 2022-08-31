import { useMutation } from "react-query";
import { AnkiSettingType, postAnki } from "@/lib/anki";
import { queryClient } from "pages/_app";

const deleteCardFormat = async (model: string) =>
  await postAnki(AnkiSettingType.CardFormat, { model: model }, "DELETE");

export default function useDeleteCardFormat(model: string) {
  return useMutation(() => deleteCardFormat(model), {
    onSuccess: () => {
        queryClient.invalidateQueries(AnkiSettingType.CardFormat);
      },
  });
}
