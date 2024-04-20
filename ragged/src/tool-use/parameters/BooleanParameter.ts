import { BaseParameterBuilder } from "./BaseParameter";
import { BooleanParameter } from "../types";

export class BooleanParameterBuilder extends BaseParameterBuilder<BooleanParameter> {
  constructor() {
    super();
    this._parameter.type = "boolean";
  }
}
