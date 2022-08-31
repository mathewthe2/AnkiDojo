import { useEffect, useState } from "react";
import { Button, Box, Select, Table, ScrollArea } from "@mantine/core";
import {
  fieldValueOptions,
  getModelNames,
  getModelFields,
} from "@/lib/anki";
import AnkiCardFormat from "@/interfaces/anki/ankiCardFormat";
import useAddCardFormat from "@/hooks/settings/ankiSettings/useAddCardFormat";

function AnkiCardFormatForm() {
  const [modelNames, setModelNames] = useState([]);
  const [fieldNames, setFieldNames] = useState([]);
  const [cardFormat, setCardFormat] = useState<AnkiCardFormat>();

  useEffect(() => {
    getModelNames().then((modelNames) => setModelNames(modelNames.sort()));
  }, []);

  useEffect(() => {
    if (cardFormat?.model) {
      getModelFields(cardFormat?.model).then((fieldNames) =>
        setFieldNames(fieldNames)
      );
    } else {
      setFieldNames([]);
    }
  }, [cardFormat?.model]);

  const addCardFormat = useAddCardFormat(cardFormat!);
  const handleAddCardFormat = async() => {
    if (cardFormat) {
      addCardFormat.mutate();
    }
  };

  const onSelectFieldValue = (fieldName: string, fieldValue: string) => {
    const modelMap = cardFormat?.modelMap;
    if (modelMap) {
      if (fieldValue === "" && modelMap.has(fieldName)) {
        modelMap.delete(fieldName);
      } else {
        modelMap.set(fieldName, fieldValue);
      }
    }
    setCardFormat({
      model: cardFormat?.model || "",
      modelMap: modelMap || new Map<string, string>(),
    });
  };

  return (
    <Box>
      {modelNames && (
        <Select
          searchable
          mt={10}
          label="Select Model"
          placeholder="Select model"
          data={modelNames.map((modelName) => {
            return {
              label: modelName,
              value: modelName,
            };
          })}
          onChange={(modelName) =>
            setCardFormat({
              model: modelName!,
              modelMap: new Map<string, string>(),
            })
          }
        />
      )}
      <ScrollArea type="auto" mt={10} style={{ height: 350, width: "100%" }}>
        <Table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {fieldNames.map((fieldName) => (
              <tr key={fieldName}>
                <td>{fieldName}</td>
                <td>
                  <Select
                    searchable
                    clearable
                    data={fieldValueOptions}
                    onChange={(value) =>
                      onSelectFieldValue(fieldName, value || "")
                    }
                  ></Select>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ScrollArea>
      <Button mt={20} fullWidth onClick={handleAddCardFormat}>
        Add Format
      </Button>
    </Box>
  );
}

export default AnkiCardFormatForm;
