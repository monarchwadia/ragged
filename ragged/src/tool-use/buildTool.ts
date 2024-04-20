import { EnumParameter, NewToolParameter, ParameterBuilder } from "./types";

export const buildTool = (paramNode: ParameterBuilder): NewToolParameter => {
  const param = {
    type: paramNode._parameter.type,
    description: paramNode._parameter.description,
    isRequired: paramNode._parameter.isRequired,
  };

  switch (paramNode._parameter.type) {
    case "string":
      break;
    case "number":
      break;
    case "boolean":
      break;
    case "enum":
      (param as EnumParameter).values = paramNode._parameter.values;
      break;
  }

  return param as NewToolParameter;
};
