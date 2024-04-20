import { JSONSchema4Object, JSONSchema4Type } from "json-schema";

export class DuplicateToolError extends Error {
  constructor(toolName: string) {
    super(`Tool with name ${toolName} already exists`);
  }
}

export class ToolNotFoundError extends Error {
  constructor(toolName: string) {
    super(`Tool with name ${toolName} not found`);
  }
}

export type Tool = {
  name: string;
  description: string;
  /**
   * A JSON schema that describes the input that the tool expects. If the validator
   * returns false or throws an error, the input is considered invalid.
   * @param obj
   * @returns
   */
  inputValidator: (input: unknown) => boolean;
  handler: (input: unknown) => unknown;
};

// TODO: This is not being used but needs to be used.

export class ToolExecutor {
  private toolMap: Record<string, Tool> = {};

  /**
   * Add a tool to the executor. If a tool with the same name already exists, a DuplicateToolError is thrown.
   * @param tool
   */
  addTool(tool: Tool) {
    if (this.toolMap[tool.name]) {
      throw new DuplicateToolError(tool.name);
    }
    this.toolMap[tool.name] = tool;
  }

  executeTool(toolName: string, inputArguments: unknown) {
    const tool = this.toolMap[toolName];

    if (!tool) {
      throw new ToolNotFoundError(toolName);
    }

    let inputIsValid = false;
    try {
      inputIsValid = tool.inputValidator(inputArguments);
    } catch (e) {
      console.error(
        `An uncaught error was thrown while validating input for tool ${toolName}`,
        e
      );
    }

    let output = undefined;
    try {
      output = tool.handler(inputArguments);
    } catch (e) {
      console.error(
        `An uncaught error was thrown while executing tool ${toolName}. Uncontrolled side effects may have occurred. To avoid this issue, please add a try/catch condition inside the tool's handler property.`,
        e
      );
    }

    return output;
  }
}
