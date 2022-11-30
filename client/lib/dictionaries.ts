import { fetchAnki, postAnki } from "./anki";

const DICTIONARIES_ENDPOINT = 'dictionaries';
export const getDictionaries = async () => await fetchAnki(DICTIONARIES_ENDPOINT);
export const setDictionayEnabled = async (id: number, enabled: boolean) => await postAnki(DICTIONARIES_ENDPOINT, { id: id, enabled: enabled }, 'PUT');
export const deleteDictionary = async  (id: number) => await postAnki(DICTIONARIES_ENDPOINT, { id: id }, 'DELETE');