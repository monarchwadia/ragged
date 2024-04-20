import { BaseParameterBuilder } from "./BaseParameter";
import { EnumParameter } from "./types";

export class EnumParameterBuilder extends BaseParameterBuilder<EnumParameter> {
  constructor() {
    super();
    this._parameter.type = "enum";
  }

  options(options: string[]): this {
    this._parameter.values = options;
    return this;
  }
}
