import { DrillType, DrillLevel } from "./DrillType";
import { DrillDataInterface } from "./DrillDataInterface";

export interface DrillCatalogInterface {
  readonly id: string;
  readonly name: string;
  readonly data: DrillDataInterface[],
  readonly description: string;
  readonly defaultType: DrillType;
  readonly disabledTypes: DrillType[];
  readonly level: DrillLevel;
  readonly tags: String[];
}