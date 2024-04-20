import { BaseParameter } from "../types";

export class BaseParameterBuilder<P extends BaseParameter> {
  public _parameter: P;

  constructor() {
    this._parameter = {
      type: undefined,
    } as P;
  }

  description(description: string): this {
    this._parameter.description = description;
    return this;
  }

  isRequired(isRequired: boolean = true): this {
    this._parameter.isRequired = isRequired;
    return this;
  }
}
