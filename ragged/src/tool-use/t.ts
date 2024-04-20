import { NewToolBuilder } from "./NewToolBuilder";
import { BooleanParameterBuilder } from "./parameters/BooleanParameter";
import { EnumParameterBuilder } from "./parameters/EnumParameter";
import { NumberParameterBuilder } from "./parameters/NumberParameter";
import { StringParameterBuilder } from "./parameters/StringParameter";

export const t = {
  tool: () => new NewToolBuilder(),
  boolean: () => new BooleanParameterBuilder(),
  string: () => new StringParameterBuilder(),
  number: () => new NumberParameterBuilder(),
  enum: () => new EnumParameterBuilder(),
};
