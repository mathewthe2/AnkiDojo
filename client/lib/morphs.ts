import { fetchAnki, postAnki } from "./anki";

export const getMorphs = async (state: MorphState) =>
  await fetchAnki(`morphs?state=${state}`);
export const setMorphs = async (state: MorphState, morphs: string[]) =>
  await postAnki("morphs", { [state]: morphs });
export const addMorphs = async (state: MorphState, morphs: string[]) =>
  await postAnki("morphs", { state: state, morphs: morphs }, "PUT");
export const removeMorphs = async (state: MorphState, morphs: string[]) =>
  await postAnki("morphs", { state: state, morphs: morphs }, "DELETE");

export enum MorphState {
  KNOWN = "MORPH_STATE_KNOWN",
}
