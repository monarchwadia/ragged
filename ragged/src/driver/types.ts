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
export type RaggedToolUseStartEvent = {
  type: "tool.started";
  index: number;
  toolCallIndex: number;
  data: {
    name: string;
  };
};
export type RaggedToolUseFinishedEvent<Args = any> = {
  type: "tool.inputs";
  index: number;
  toolCallIndex: number;
  data: {
    name: string;
    arguments: Args;
  };
};
export type RaggedToolUseResultEvent<Args = any, Result = any> = {
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
export type RaggedChunkEvent = {
  type: "text.chunk";
  index: number;
  data: string;
};
export type RaggedCollectedEvent = {
  type: "text.joined";
  index: number;
  data: string;
};

export type RaggedLlmPromisableEvent =
  | RaggedFinishedEvent
  | RaggedToolUseFinishedEvent
  | RaggedToolUseResultEvent;

export type RaggedLlmStreamEvent =
  | RaggedFinishedEvent
  | RaggedToolUseFinishedEvent
  | RaggedToolUseResultEvent
  | RaggedStartedEvent
  | RaggedChunkEvent
  | RaggedCollectedEvent
  | RaggedToolUseStartEvent;
