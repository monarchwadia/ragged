export type RaggedConfigValidationResult =
  | { isValid: true }
  | { isValid: false; errors: string[] };

export type RaggedLlmStreamEvent =
  | { type: "started"; index: number }
  | { type: "chunk"; index: number; payload: string }
  | { type: "collected"; index: number; payload: string }
  | { type: "finished"; index: number; payload: string }
  | {
      type: "tool_use_start";
      index: number;
      toolCallIndex: number;
      payload: {
        name: string;
      };
    }
  | {
      type: "tool_use_finish";
      index: number;
      toolCallIndex: number;
      payload: {
        name: string;
        arguments: unknown;
      };
    }
  | {
      type: "tool_use_result";
      index: number;
      toolCallIndex: number;
      payload: {
        name: string;
        arguments: unknown;
        result: unknown;
      };
    };
