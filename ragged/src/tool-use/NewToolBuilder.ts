import { NewTool } from "./parameters/types";

export class NewToolBuilder {
  _parameters: NewTool;

  constructor() {
    this._parameters = {
      title: undefined,
      description: undefined,
      inputs: undefined,
    };
  }

  title(title: string) {
    this._parameters.title = title;
    return this;
  }

  description(description: string) {
    this._parameters.description = description;
    return this;
  }

  inputs(inputs: NewTool["inputs"]) {
    this._parameters.inputs = inputs;
    return this;
  }
}
