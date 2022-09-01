import { useMutation } from "react-query";
import { AnkiSettingType, postAnki } from "@/lib/anki";
import { queryClient } from "pages/_app";
import AnkiCardFormat from "@/interfaces/anki/ankiCardFormat";

const addOrModifyCardFormat = async (cardFormat: AnkiCardFormat) =>
  await postAnki(AnkiSettingType.CardFormat, {
    model_name: cardFormat.modelName,
    model_map: Object.fromEntries(cardFormat.modelMap),
  });

export default function useUpdateCardFormat(cardFormat: AnkiCardFormat) {
  return useMutation(() => addOrModifyCardFormat(cardFormat), {
    onSuccess: () => {
        queryClient.invalidateQueries(AnkiSettingType.CardFormat);
      },
  });
}
