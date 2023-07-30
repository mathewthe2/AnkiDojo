import { ProcessingStatusType, fetchAnki } from "./anki";

export interface ProcessingResponseInterface {
  id: number;
  data: any;
  progress: number;
  status: ProcessingStatusType;
}

export const getProcessingResponse = async (location: string): Promise<ProcessingResponseInterface> => {
  const response = await fetchAnki(location);
  return response
}
