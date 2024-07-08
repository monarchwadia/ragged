import { OpenAiChatAdapter } from "./OpenAiChatAdapter";
import { ApiClient } from "../../../support/ApiClient";
import { startPollyRecording } from "../../../test/startPollyRecording";
import { mockDeep } from "jest-mock-extended";
import { Logger } from "../../../support/logger/Logger";

describe("OpenAiChatAdapter", () => {
  let apiClient: ApiClient;
  let adapter: OpenAiChatAdapter;
  let spy: jest.SpyInstance;

  describe("integration", () => {
    beforeEach(() => {
      apiClient = new ApiClient();
      spy = jest.spyOn(apiClient, "post");
      const config = {
        apiKey: process.env.OPENAI_API_KEY,
      };
      adapter = new OpenAiChatAdapter(config);
    });

    afterEach(() => {
      jest.clearAllMocks();
      spy.mockClear();
    });

    it("should do API calls as expected", async () => {
      const polly = startPollyRecording(
        "OpenAiChatAdapter > should do API calls as expected"
      );

      const response = await adapter.chat({
        history: [
          {
            type: "user",
            text: "Hello, World!",
          },
        ],
        context: {
          apiClient
        }
      });

      await polly.stop();

      expect(response.history).toHaveLength(1);
      expect(response.history[0]).toMatchObject({
        type: "bot",
        text: "Hello! How can I assist you today?",
      });
    });

    it("should do tool calling", async () => {
      const polly = startPollyRecording(
        "OpenAiChatAdapter > should do tool calling"
      );

      const response = await adapter.chat({
        history: [
          {
            type: "user",
            text: "Retrieve today's news using the todays-news tool.",
          },
        ],
        context: { apiClient },
        tools: [
          {
            id: "todays-news",
            description: "Retrieve today's news.",
            props: {
              type: "object",
              props: {
                query: {
                  type: "string",
                  description: "The query to search for.",
                  required: true,
                },
              },
            },
            handler: async () => {
              return "Here are today's news: ...";
            },
          },
        ],
      });

      await polly.stop();

      expect(response.history).toMatchInlineSnapshot(`
        [
          {
            "text": null,
            "toolCalls": [
              {
                "meta": {
                  "toolRequestId": "call_MhanXUgR5MD6pSGbsWi2D4Of",
                },
                "props": "{"query":"latest news"}",
                "toolName": "todays-news",
                "type": "tool.request",
              },
            ],
            "type": "bot",
          },
        ]
      `);
    });

    describe("multimodal", () => {
      it("should send requests to the multimodal endpoint", async () => {
        const polly = startPollyRecording(
          "OpenAiChatAdapter > multimodal > should send requests to the multimodal endpoint"
        );

        const response = await adapter.chat({
          model: "gpt-4o",
          context: { apiClient },
          history: [
            {
              type: "user",
              text: "What does this image contain?",
              attachments: [
                {
                  type: "image",
                  payload: {
                    data: "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=",
                    encoding: "base64_data_url",
                    mimeType: "image/png",
                  },
                },
              ],
            },
          ],
        });

        await polly.stop();

        expect(response.history).toMatchInlineSnapshot(`
            [
              {
                "text": "This image contains a widely recognized emoji commonly known as the "Heart Eyes Emoji" or "Smiling Face with Heart-Eyes." The emoji features a yellow face with an open smile and heart-shaped eyes, conveying an expression of love, adoration, or strong affection.",
                "type": "bot",
              },
            ]
        `);
      });

      it("can handle multiple images", async () => {
        const polly = startPollyRecording(
          "OpenAiChatAdapter > multimodal > can handle multiple images"
        );

        const response = await adapter.chat({
          model: "gpt-4o",
          context: { apiClient },
          history: [
            {
              type: "user",
              text: "What do these images contain? Describe them.",
              attachments: [
                {
                  type: "image",
                  payload: {
                    data: "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=",
                    encoding: "base64_data_url",
                    mimeType: "image/png",
                  },
                },
                {
                  type: "image",
                  payload: {
                    encoding: "base64_data_url",
                    data: "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAIAAADTED8xAAADMElEQVR4nOzVwQnAIBQFQYXff81RUkQCOyDj1YOPnbXWPmeTRef+/3O/OyBjzh3CD95BfqICMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMO0TAAD//2Anhf4QtqobAAAAAElFTkSuQmCC",
                    mimeType: "image/png",
                  },
                },
              ],
            },
          ],
        });

        await polly.stop();

        expect(response.history).toMatchInlineSnapshot(`
          [
            {
              "text": "The first image is of a smiling face with heart-shaped eyes, which is commonly known as the "heart eyes" emoji. It expresses love, admiration, or strong liking for someone or something.

          The second image is a gradient that transitions from black at the top left to orange at the top right to blue at the bottom left to white at the bottom right. It doesn't depict any specific object but serves as a visually appealing background.",
              "type": "bot",
            },
          ]
        `);
      });
    });
  });

  describe("behaviour", () => {
    beforeEach(() => {
      apiClient = mockDeep<ApiClient>();
      adapter = new OpenAiChatAdapter({
        apiKey: "nope-key",
        organizationId: "nope-org",
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should do API calls as expected", async () => {
      try {
        await adapter.chat({
          history: [
            {
              type: "user",
              text: "Hello, World!",
            },
          ],
          context: { apiClient },
        });
      } catch (e) {
        // expected
      }

      expect(apiClient.post).toHaveBeenCalledTimes(1);
      expect(apiClient.post).toHaveBeenCalledWith(
        "https://api.openai.com/v1/chat/completions",
        {
          body: {
            messages: [
              {
                role: "user",
                content: "Hello, World!",
              },
            ],
            model: "gpt-3.5-turbo",
            tools: undefined,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer nope-key`,
            "OpenAI-Organization": "nope-org",
          },
        }
      );
    });
  });
});
