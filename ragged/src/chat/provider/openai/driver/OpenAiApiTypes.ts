
type OpenAiUserMessage = {
  role: "user";
  content: string | null;
}

type OpenAiAssistantMessage = {
  role: "assistant";
  content: string | null;
  tool_calls?: ChoiceToolCall[];
}

type OpenAiSystemMessage = {
  role: "system";
  content: string | null;
}

export type OpenAiMessage = OpenAiUserMessage | OpenAiAssistantMessage | OpenAiSystemMessage;

// tool calls

export type OaiToolParamObject = {
  type: "object";
  description?: string;
  properties: Record<string, OaiToolParam>;
  required?: string[];
}

export type OaiToolParamString = {
  type: "string";
  description?: string;
}

export type OaiToolParamNumber = {
  type: "number";
  description?: string;
}

export type OaiToolParamArray = {
  type: "array";
  description?: string;
  items?: OaiToolParam;
}

export type OaiToolParamBoolean = {
  type: "boolean";
  description?: string;
}

export type OaiToolParam = OaiToolParamObject | OaiToolParamString | OaiToolParamNumber | OaiToolParamArray | OaiToolParamBoolean | undefined;

export type OaiTool = {
  type: "function",
  function: {
    name: string,
    description: string,
    parameters: OaiToolParam
  }
}

export type OpenAiChatCompletionRequestBody = {
  model: string;
  messages: {
    role: string;
    content: string | null;
    // TODO: the upstream DTO might be different from ChoiceToolCall
    tool_calls?: ChoiceToolCall[];
  }[];
  tools?: OaiTool[];
}

export type OpenAiChatCompletionResponseBody = {
  choices: Choice[];
  created: number;
  id: string;
  model: string;
  object: string;
  system_fingerprint: null | string;
  usage: Usage;
};

export type Choice = {
  finish_reason: string;
  index: number;
  logprobs: null;
  message: Message;
};

export type ChoiceToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export type Message = {
  content: string | null;
  role: string;
  tool_calls?: ChoiceToolCall[];
};

export type Usage = {
  completion_tokens: number;
  prompt_tokens: number;
  total_tokens: number;
};
