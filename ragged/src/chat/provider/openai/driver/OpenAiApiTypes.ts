
type OpenAiUserMessage = {
  role: "user";
  content: string;
}

type OpenAiAssistantMessage = {
  role: "assistant";
  content: string;
}

type OpenAiSystemMessage = {
  role: "system";
  content: string;
}

type OpenAiToolMessage = {
  role: "tool";
  content: string;
}

export type OpenAiMessage = OpenAiUserMessage | OpenAiAssistantMessage | OpenAiSystemMessage | OpenAiToolMessage;

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

export type Message = {
  content: string;
  role: string;
};

export type Usage = {
  completion_tokens: number;
  prompt_tokens: number;
  total_tokens: number;
};
