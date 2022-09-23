import { Definition } from "@/lib/japanese";

export default interface ExpressionTerm {
  userExpression: string;
  definition?: Definition;
}
