import { fetchAnki, postAnki, postAnkiMultiBody } from "./anki";

const DICTIONARIES_ENDPOINT = 'dictionaries';
export const getDictionaries = async () => await fetchAnki(DICTIONARIES_ENDPOINT);
export const addDictionary = async (file: any) => {
    let formData = new FormData();
    formData.append('file', file);
    return await postAnkiMultiBody(DICTIONARIES_ENDPOINT, formData)
};
export const setDictionayEnabled = async (id: number, enabled: boolean) => await postAnki(DICTIONARIES_ENDPOINT, { id: id, enabled: enabled }, 'PUT');
export const deleteDictionary = async (id: number) => await postAnki(DICTIONARIES_ENDPOINT, { id: id }, 'DELETE');