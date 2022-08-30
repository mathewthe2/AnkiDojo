import { useEffect, useState } from "react";
import { Button, Box, Select, Table, ScrollArea } from "@mantine/core";
import { getModelNames, getModelFields } from "@/lib/anki";

const fieldValueOptions = [
  "Expression",
  "Reading",
  "Glossary",
  "Glossary Brief",
  "Audio",
  "Sentence",
  "Sentence Audio",
  "Picture",
  "Pitch Accent",
  "Frequencies",
];

function AnkiCardFormatForm() {
  const [modelNames, setModelNames] = useState([]);
  const [activeModel, setActiveModel] = useState("");
  const [fieldNames, setFieldNames] = useState([]);

  useEffect(() => {
    getModelNames().then((modelNames) => setModelNames(modelNames.sort()));
  }, []);

  useEffect(() => {
    if (activeModel.length > 0) {
      getModelFields(activeModel).then((fieldNames) =>
        setFieldNames(fieldNames)
      );
    } else {
      setFieldNames([]);
    }
  }, [activeModel]);

  return (
    <Box>
      {modelNames && (
        <Select
          mt={10}
          label="Select Model"
          placeholder="Select model"
          data={modelNames.map((modelName) => {
            return {
              label: modelName,
              value: modelName,
            };
          })}
          onChange={(modelName) => setActiveModel(modelName!)}
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
                  <Select data={fieldValueOptions}></Select>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ScrollArea>
      <Button mt={20} fullWidth>
        Add Format
      </Button>
    </Box>
  );
}

export default AnkiCardFormatForm;
