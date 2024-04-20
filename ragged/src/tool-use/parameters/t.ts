import { NewToolBuilder } from "../NewToolBuilder";
import { BooleanParameterBuilder } from "./BooleanParameter";
import { EnumParameterBuilder } from "./EnumParameter";
import { NumberParameterBuilder } from "./NumberParameter";
import { StringParameterBuilder } from "./StringParameter";

export const t = {
  tool: () => new NewToolBuilder(),
  boolean: () => new BooleanParameterBuilder(),
  string: () => new StringParameterBuilder(),
  number: () => new NumberParameterBuilder(),
  enum: () => new EnumParameterBuilder(),
};
