import type { ClientOptions } from "openai";
import { NewToolBuilder } from "./tool-use/NewToolBuilder";

type OpenAiConfig = {
  provider: "openai";
  config: ClientOptions;
};

type CohereConfig = {
  provider: "cohere";
  config: any;
};

export type RaggedConfiguration = OpenAiConfig | CohereConfig;

export type PredictOptions = {
  tools: NewToolBuilder[];
  requestOverrides: unknown;
};

export namespace RaggedChat {
  export type Options = {
    tools: NewToolBuilder[];
    requestOverrides: unknown;
  };

  export namespace Stream {
    export type StreamingChatResponseEvent = {
      type: "streaming-chat-response";
      index: number;
      payload: {
        text: History.TextItem;
        toolRequests?: History.ToolRequestItem[];
      };
    };
  }

  export namespace History {
    export type TextItem = {
      type: "text";
      data: {
        sender: "human" | "ai" | "system";
        text: string;
      };
    };

    export type ToolRequestItem<P = unknown> = {
      type: "tool-request";
      data: {
        id: string;
        sender: "ai";
        toolName: string;
        payload: P;
      };
    };

    export type ToolResponseItem<R = unknown> = {
      type: "tool-response";
      data: {
        id: string;
        sender: "ai";
        toolName: string;
        response: R;
      };
    };

    export type Item = TextItem | ToolRequestItem | ToolResponseItem;
  }
}
