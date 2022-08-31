import { useEffect, useState } from "react";
import { Text, Button, Box, Select, Table, ScrollArea } from "@mantine/core";
import { fieldValueOptions, addOrModifyCardFormat } from "@/lib/anki";
import AnkiCardFormat from "@/interfaces/anki/ankiCardFormat";
import useDeleteCardFormat from "@/hooks/settings/ankiSettings/useDeleteCardFormat";
import useUpdateCardFormat from "@/hooks/settings/ankiSettings/useUpdateCardFormat";

function AnkiCardFormatEditForm({
  cardFormat,
}: {
  cardFormat: AnkiCardFormat;
}) {
  const [newCardFormat, setNewCardFormat] = useState<AnkiCardFormat>(cardFormat);

  const updateCardFormat = useUpdateCardFormat(cardFormat);

  const handleUpdateCardFormat = async() => updateCardFormat.mutate();

  const deleteCardFormat= useDeleteCardFormat(cardFormat.model);

  const handleDeleteCardFormat = async() => {
    deleteCardFormat.mutate();
  }

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
            {Array.from(cardFormat.modelMap.entries()).map(
              ([fieldName, fieldValue]) => (
                <tr key={fieldName}>
                  <td>{fieldName}</td>
                  <td>
                    <Select
                      clearable
                      searchable
                      data={fieldValueOptions}
                      defaultValue={fieldValue}
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
      <Button mt={20} fullWidth variant="outline" onClick={handleDeleteCardFormat}>
        Delete
      </Button>
    </Box>
  );
}

export default AnkiCardFormatEditForm;
