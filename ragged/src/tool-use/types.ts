import { BooleanParameterBuilder } from "./parameters/BooleanParameter";
import { EnumParameterBuilder } from "./parameters/EnumParameter";
import { NumberParameterBuilder } from "./parameters/NumberParameter";
import { StringParameterBuilder } from "./parameters/StringParameter";

export interface BaseParameter {
  type: string | undefined;
  description?: string;
  isRequired?: boolean;
}

export interface StringParameter extends BaseParameter {
  type: "string";
}

export interface NumberParameter extends BaseParameter {
  type: "number";
}

export interface BooleanParameter extends BaseParameter {
  type: "boolean";
}

export interface EnumParameter extends BaseParameter {
  type: "enum";
  values: string[];
}

// export interface ObjectParameter extends BaseParameter {
//   type: "object";
//   props: Record<string, NewToolParameter>;
// }

// export interface ArrayParameter extends BaseParameter {
//   type: "array";
//   props: NewToolParameter;
// }

// export interface TupleParameter extends BaseParameter {
//   type: "tuple";
//   props: NewToolParameter[];
// }

export type PrimitiveParameter =
  | StringParameter
  | NumberParameter
  | BooleanParameter
  | EnumParameter;

// TODO: support more complex parameters
export type NewToolParameter = PrimitiveParameter;
// | ObjectParameter
// | ArrayParameter
// | TupleParameter;

export interface NewTool {
  title: string | undefined;
  description: string | undefined;
  inputs: Record<string, NewToolParameter> | undefined;
}

export type ParameterBuilder =
  | BooleanParameterBuilder
  | EnumParameterBuilder
  | NumberParameterBuilder
  | StringParameterBuilder;
