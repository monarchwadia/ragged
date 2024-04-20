import { buildTool } from "./buildTool";
import { NewTool, NewToolParameter, ParameterBuilder } from "./types";

export class NewToolBuilder {
  _parameters: NewTool;
  _inputs: Record<string, ParameterBuilder> | undefined;

  constructor() {
    this._parameters = {
      title: undefined,
      description: undefined,
      inputs: undefined,
    };

    this._inputs = undefined;
  }

  title(title: string) {
    this._parameters.title = title;
    return this;
  }

  description(description: string) {
    this._parameters.description = description;
    return this;
  }

  inputs(inputs: Record<string, ParameterBuilder>) {
    this._inputs = inputs;
    return this;
  }

  /**
   * Builds the Ragged tool definition that can be used by drivers to define API-level LLM tools.
   * @returns {NewTool} The built tool definition.
   */
  build(): NewTool {
    const builtToolDefinition: NewTool = {
      title: this._parameters.title,
      description: this._parameters.description,
      inputs: {},
    };

    for (const key in this._inputs) {
      (builtToolDefinition.inputs as Exclude<NewTool["inputs"], undefined>)[
        key
      ] = buildTool(this._inputs[key]);
    }

    return builtToolDefinition;
  }
}
