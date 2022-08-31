import { useEffect, useState } from "react";
import { Button, Box, Select, Table, ScrollArea } from "@mantine/core";
import { fieldValueOptions } from "@/lib/anki";
import AnkiCardFormat from "@/interfaces/anki/ankiCardFormat";
import useDeleteCardFormat from "@/hooks/settings/ankiSettings/useDeleteCardFormat";
import useUpdateCardFormat from "@/hooks/settings/ankiSettings/useUpdateCardFormat";
import { getModelFields } from "@/lib/anki";

function AnkiCardFormatEditForm({
  cardFormat,
  onDeleteCallback,
}: {
  cardFormat: AnkiCardFormat;
  onDeleteCallback: () => void;
}) {
  const [newCardFormat, setNewCardFormat] =
    useState<AnkiCardFormat>(cardFormat);
  const [fieldNames, setFieldNames] = useState<string[]>([]);

    useEffect(() => {
      getModelFields(cardFormat?.model).then((fieldNames:string[]) => setFieldNames(fieldNames))
    }, []);

  const updateCardFormat = useUpdateCardFormat(cardFormat);

  const handleUpdateCardFormat = async () => updateCardFormat.mutate();

  const deleteCardFormat = useDeleteCardFormat(cardFormat.model, onDeleteCallback);

  const handleDeleteCardFormat = async () => {
    deleteCardFormat.mutate();
  };

  const onSelectFieldValue = (fieldName: string, fieldValue: string) => {
    const modelMap: Map<string, string> = newCardFormat.modelMap;
    if (modelMap) {
      if (fieldValue === "" && modelMap.has(fieldName)) {
        modelMap.delete(fieldName);
      } else {
        modelMap.set(fieldName, fieldValue);
      }
    }
    setNewCardFormat({
      model: newCardFormat.model,
      modelMap: modelMap || new Map<string, string>(),
    });
  };

  return (
    <Box>
      <ScrollArea type="auto" mt={10} style={{ height: 350, width: "100%" }}>
        <Table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
          {fieldNames.map(
              (fieldName) => (
                <tr key={fieldName}>
                  <td>{fieldName}</td>
                  <td>
                    <Select
                      clearable
                      searchable
                      data={fieldValueOptions}
                      defaultValue={cardFormat.modelMap.has(fieldName) ? cardFormat.modelMap.get(fieldName) : ''}
                      onChange={(value) =>
                        onSelectFieldValue(fieldName, value || "")
                      }
                    ></Select>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </Table>
      </ScrollArea>
      <Button mt={20} fullWidth onClick={handleUpdateCardFormat}>
        Save
      </Button>
      <Button
        mt={20}
        fullWidth
        variant="outline"
        onClick={handleDeleteCardFormat}
      >
        Delete
      </Button>
    </Box>
  );
}

export default AnkiCardFormatEditForm;
