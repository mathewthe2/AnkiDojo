import { useMutation } from "react-query";
import { AnkiSettingType, postAnki } from "@/lib/anki";
import { queryClient } from "pages/_app";

const deleteCardFormat = async (modelName: string) =>
  await postAnki(AnkiSettingType.CardFormat, { model_name: modelName }, "DELETE");

export default function useDeleteCardFormat(modelName: string, onSucessCallback?: Function) {
  return useMutation(() => deleteCardFormat(modelName), {
    onSuccess: () => {
        queryClient.invalidateQueries(AnkiSettingType.CardFormat);
        if (onSucessCallback) {
          onSucessCallback();
        }
      },
  });
}
