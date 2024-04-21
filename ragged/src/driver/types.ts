export type RaggedConfigValidationResult =
  | { isValid: true }
  | { isValid: false; errors: string[] };

export type RaggedFinishedEvent = {
  type: "finished";
  index: number;
  payload: string;
};
export type RaggedToolUseFinishedEvent = {
  type: "tool_use_finish";
  index: number;
  toolCallIndex: number;
  payload: {
    name: string;
    arguments: unknown;
  };
};
export type RaggedToolUseResultEvent = {
  type: "tool_use_result";
  index: number;
  toolCallIndex: number;
  payload: {
    name: string;
    arguments: unknown;
    result: unknown;
  };
};

export type RaggedStartedEvent = { type: "started"; index: number };
export type RaggedChunkEvent = {
  type: "chunk";
  index: number;
  payload: string;
};
export type RaggedCollectedEvent = {
  type: "collected";
  index: number;
  payload: string;
};
export type RaggedToolUseStartEvent = {
  type: "tool_use_start";
  index: number;
  toolCallIndex: number;
  payload: {
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
