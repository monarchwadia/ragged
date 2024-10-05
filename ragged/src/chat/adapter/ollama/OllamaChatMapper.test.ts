import { ApiClient } from "../../../support/ApiClient";
import { MappingError } from "../../../support/RaggedErrors";
import { ChatAdapterRequest } from "../BaseChatAdapter.types";
import { OllamaChatResponseRoot } from "./OllamaApiResponseTypes";
import { OllamaChatMapper } from "./OllamaChatMapper";

describe("OllamaChatMapper", () => {
  let apiClient: ApiClient;

  beforeEach(() => {
    apiClient = new ApiClient();
  })
  describe("mapChatRequestToOllamaRequest", () => {
    it("should map a single user message to just the message field, and not contain any history field", () => {
      const request: ChatAdapterRequest = {
        history: [
          {
            type: "user",
            text: "Hello, how are you?",
          },
        ],
        context: {
          apiClient
        }
      };

      const mappedRequest = OllamaChatMapper.mapChatRequestToOllamaRequest(request, { model: "llama3" });

      expect(mappedRequest).toMatchObject({
        model: "llama3",
        messages: [
          {
            role: "user",
            content: "Hello, how are you?",
          }
        ],
        stream: false
      });
    });

    it("should correctly map user, system, and bot messages", () => {
      const request: ChatAdapterRequest = {
        history: [
          {
            type: "system",
            text: "I am a system message",
          },
          {
            type: "bot",
            text: "I am a bot message",
          },
          {
            type: "user",
            text: "Hello, how are you?",
          },
        ],
        context: {
          apiClient
        }
      };

      const mappedRequest = OllamaChatMapper.mapChatRequestToOllamaRequest(request, { model: "llama3" });

      expect(mappedRequest).toMatchObject({
        model: "llama3",
        messages: [
          {
            role: "system",
            content: "I am a system message",
          },
          {
            role: "assistant",
            content: "I am a bot message",
          },
          {
            role: "user",
            content: "Hello, how are you?",
          }
        ],
        stream: false
      });
    });

    it("throws an error if no model is provided", () => {
      const request: ChatAdapterRequest = {
        history: [
          {
            type: "user",
            text: "Hello, how are you?",
          },
        ],
        context: { apiClient }
      };

      expect(() => OllamaChatMapper.mapChatRequestToOllamaRequest(request, { model: "" })).toThrow(MappingError);
    });

    it("throws an error if no messages are provided", () => {
      const request: ChatAdapterRequest = {
        history: [],
        context: {
          apiClient
        }
      };

      expect(() => OllamaChatMapper.mapChatRequestToOllamaRequest(request, { model: "llama3" })).toThrow(MappingError);
    });
  });

  describe("mapOllamaResponseToChatResponse", () => {
    it("should map the response to a chat response", () => {
      const response: OllamaChatResponseRoot = {
        message: {
          role: "assistant",
          content: "I am a response"
        },
        done: true,
        meta: {
          model: "llama3",
          created_at: "2023-08-04T08:52:19.385406455-07:00"
        }
      };

      const mappedResponse = OllamaChatMapper.mapOllamaResponseToChatResponse(response);

      expect(mappedResponse).toMatchObject([
        {
          type: "bot",
          text: "I am a response"
        }
      ]
      );
    });
  });
});
