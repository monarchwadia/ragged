export type RaggedConfigValidationResult =
  | { isValid: true }
  | { isValid: false; errors: string[] };

// General events
export type RaggedStartedEvent = { type: "started"; index: number };
export type RaggedFinishedEvent = {
  type: "finished";
  index: number;
  data: string;
};

// Tool events
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

// Text events
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

export type RaggedLlmPromisableEvent =
  | RaggedFinishedEvent
  | RaggedToolInputsEvent
  | RaggedToolFinishedEvent;

export type RaggedLlmStreamEvent =
  | RaggedFinishedEvent
  | RaggedToolInputsEvent
  | RaggedToolFinishedEvent
  | RaggedStartedEvent
  | RaggedTextChunkEvent
  | RaggedTextJoinedEvent
  | RaggedToolStartedEvent;
