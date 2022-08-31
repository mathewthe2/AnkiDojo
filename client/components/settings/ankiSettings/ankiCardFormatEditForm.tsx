import { useEffect, useState } from "react";
import { Text, Button, Box, Select, Table, ScrollArea } from "@mantine/core";
import { fieldValueOptions, addOrModifyCardFormat } from "@/lib/anki";
import AnkiCardFormat from "@/interfaces/anki/ankiCardFormat";

function AnkiCardFormatEditForm({
  cardFormat,
}: {
  cardFormat: AnkiCardFormat;
}) {
  const [newCardFormat, setNewCardFormat] = useState<AnkiCardFormat>(cardFormat);
  
  const updateCardFormat = () => {
    addOrModifyCardFormat(newCardFormat);
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
      <Button mt={20} fullWidth onClick={updateCardFormat}>
        Save
      </Button>
      <Button mt={20} fullWidth variant="outline">
        Delete
      </Button>
    </Box>
  );
}

export default AnkiCardFormatEditForm;
