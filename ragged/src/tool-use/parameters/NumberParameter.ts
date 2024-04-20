import { BaseParameterBuilder } from "./BaseParameter";
import { NumberParameter } from "../types";

export class NumberParameterBuilder extends BaseParameterBuilder<NumberParameter> {
  constructor() {
    super();
    this._parameter.type = "number";
  }
}
