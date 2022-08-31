import { useMutation } from "react-query";
import { AnkiSettingType, postAnki } from "@/lib/anki";
import { queryClient } from "pages/_app";
import AnkiCardFormat from "@/interfaces/anki/ankiCardFormat";

const addCardFormat = async (cardFormat: AnkiCardFormat) =>
  await postAnki(AnkiSettingType.CardFormat, {
    model: cardFormat.model,
    model_map: Object.fromEntries(cardFormat.modelMap),
  });

export default function useAddCardFormat(cardFormat: AnkiCardFormat) {
  return useMutation(() => addCardFormat(cardFormat), {
    onSuccess: () => {
        queryClient.invalidateQueries(AnkiSettingType.CardFormat);
      },
  });
}
