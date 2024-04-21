import OpenAI from "openai";
import { NewTool } from "../../tool-use/types";

export const mapToolToOpenAi = (tool: NewTool): OpenAI.ChatCompletionTool => {
  if (!tool.title) throw new Error("Tool title is required!");

  const openAiTool: OpenAI.ChatCompletionTool = {
    type: "function",
    function: {
      name: tool.title,
    },
  };

  if (tool.description) {
    openAiTool.function.description = tool.description;
  }

  if (tool.inputs) {
    openAiTool.function.parameters = {
      type: "object",
      properties: {},
    };
    for (const key in tool.inputs) {
      const parameter = tool.inputs[key];
      (openAiTool.function.parameters.properties as any)[key] = {
        type: parameter.type,
      };
    }
  }

  return openAiTool;
};
