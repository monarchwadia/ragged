
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

type OpenAiMessage = OpenAiUserMessage | OpenAiAssistantMessage | OpenAiSystemMessage | OpenAiToolMessage;

export type OpenAiChatCompletionRequestBody = {
  model: string;
  messages: {
    role: string;
    content: string;
  }[];
  tools?: any[];
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
