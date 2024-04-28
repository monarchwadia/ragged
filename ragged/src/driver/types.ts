export type RaggedConfigValidationResult =
  | {
      isValid: true;
    }
  | {
      isValid: false;
      errors: string[];
    };
export type RaggedResponseStartedEvent = {
  type: "ragged.started";
};
export type RaggedResponseFinishedEvent = {
  type: "ragged.finished";
  data: RaggedHistoryItem[];
};
export type RaggedToolStartedEvent = {
  type: "tool.started";
  index: number;
  toolCallIndex: number;
  data: {
    name: string;
  };
};
export type RaggedToolInputsEvent<Args = any> = {
  type: "tool.inputs";
  index: number;
  toolCallIndex: number;
  data: {
    name: string;
    arguments: Args;
  };
};
export type RaggedToolFinishedEvent<Args = any, Result = any> = {
  type: "tool.finished";
  index: number;
  toolCallIndex: number;
  data: {
    name: string;
    arguments: Args;
    result: Result;
  };
};
export type RaggedTextStartedEvent = {
  type: "text.started";
  index: number;
};
export type RaggedTextChunkEvent = {
  type: "text.chunk";
  index: number;
  data: string;
};
export type RaggedTextJoinedEvent = {
  type: "text.joined";
  index: number;
  data: string;
};
export type RaggedTextFinishedEvent = {
  type: "text.finished";
  index: number;
  data: string;
};

export type TextHistoryItem = {
  type: "history.text";
  role: "ai" | "human" | "system";
  data: {
    text: string;
  };
};
export type ToolRequestHistoryItem = {
  type: "history.tool.request";
  toolRequestId: string;
  toolName: string;
  inputs: any;
};
export type ToolResultHistoryItem = {
  type: "history.tool.result";
  toolRequestId: string;
  toolName: string;
  result: any;
};

export type RaggedHistoryItem =
  | TextHistoryItem
  | ToolRequestHistoryItem
  | ToolResultHistoryItem;

export type RaggedLlmStreamEvent =
  | RaggedHistoryItem
  | RaggedResponseStartedEvent
  | RaggedToolStartedEvent
  | RaggedToolInputsEvent
  | RaggedToolFinishedEvent
  | RaggedTextStartedEvent
  | RaggedTextChunkEvent
  | RaggedTextJoinedEvent
  | RaggedTextFinishedEvent
  | RaggedResponseFinishedEvent;
