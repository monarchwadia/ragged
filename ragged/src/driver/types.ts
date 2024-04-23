export type RaggedConfigValidationResult =
  | { isValid: true }
  | { isValid: false; errors: string[] };

export type RaggedFinishedEvent = {
  type: "finished";
  index: number;
  data: string;
};
export type RaggedToolUseFinishedEvent<Args = any> = {
  type: "tool_use_finish";
  index: number;
  toolCallIndex: number;
  data: {
    name: string;
    arguments: Args;
  };
};
export type RaggedToolUseResultEvent<Args = any, Result = any> = {
  type: "tool_use_result";
  index: number;
  toolCallIndex: number;
  data: {
    name: string;
    arguments: Args;
    result: Result;
  };
};

export type RaggedStartedEvent = { type: "started"; index: number };
export type RaggedChunkEvent = {
  type: "chunk";
  index: number;
  data: string;
};
export type RaggedCollectedEvent = {
  type: "collected";
  index: number;
  data: string;
};
export type RaggedToolUseStartEvent = {
  type: "tool_use_start";
  index: number;
  toolCallIndex: number;
  data: {
    name: string;
  };
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
