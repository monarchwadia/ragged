import { BaseParameterBuilder } from "./BaseParameter";
import { StringParameter } from "./types";

export class StringParameterBuilder extends BaseParameterBuilder<StringParameter> {
  constructor() {
    super();
    this._parameter.type = "string";
  }
}
