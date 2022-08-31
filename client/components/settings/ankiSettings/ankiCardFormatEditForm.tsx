import { useEffect, useState } from "react";
import { Text, Button, Box, Select, Table, ScrollArea } from "@mantine/core";
import { fieldValueOptions } from "@/lib/anki";
import AnkiCardFormat from "@/interfaces/anki/ankiCardFormat";

function AnkiCardFormatEditForm({
  cardFormat,
}: {
  cardFormat: AnkiCardFormat;
}) {

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
            {Object.entries(cardFormat.modelMap).map(
              ([fieldName, fieldValue]) => (
                <tr key={fieldName}>
                  <td>{fieldName}</td>
                  <td>
                    <Select
                      clearable
                      searchable
                      data={fieldValueOptions}
                      value={fieldValue}
                    ></Select>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </Table>
      </ScrollArea>
      <Button mt={20} fullWidth>
        Save
      </Button>
      <Button mt={20} fullWidth variant="outline">
        Delete
      </Button>
    </Box>
  );
}

export default AnkiCardFormatEditForm;
