import { DrillDataInterface } from "./DrillDataInterface";
import { DrillType } from "./DrillType";

export default interface DrillQuestionInterface {
    readonly questionData: DrillDataInterface;
    readonly questionType: DrillType;
}
  