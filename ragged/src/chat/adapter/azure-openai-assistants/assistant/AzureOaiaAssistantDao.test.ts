import { startPollyRecording } from "../../../../test/startPollyRecording";
import { ApiClient } from "../../../../support/ApiClient";
import { AzureOaiaAssistantDao } from "./AzureOaiaAssistantDao";

describe("AzureOaiaAssistantDao", () => {
  describe("createAssistant", () => {
    it("can be created", async () => {
      const apiClient = new ApiClient();
      const azureOaiaAssistantDao = new AzureOaiaAssistantDao(apiClient);

      const polly = startPollyRecording(
        "AzureOaiaAssistantDao > createAssistant > can be created"
      );

      const assistant = await azureOaiaAssistantDao.createAssistant(
        process.env.OPENAI_API_KEY as string,
        {
          name: "Financial Analyst Assistant",
          instructions:
            "You are an expert financial analyst. Use you knowledge base to answer questions about audited financial statements.",
          tools: [{ type: "file_search" }],
          model: "gpt-4o",
        }
      );

      polly.stop();

      expect(assistant).toMatchInlineSnapshot(`
        {
          "created_at": 1718845341,
          "description": null,
          "id": "asst_IvL0KnQJj47ddgRgcGBwtugj",
          "instructions": "You are an expert financial analyst. Use you knowledge base to answer questions about audited financial statements.",
          "metadata": {},
          "model": "gpt-4o",
          "name": "Financial Analyst Assistant",
          "object": "assistant",
          "response_format": "auto",
          "temperature": 1,
          "tool_resources": {
            "file_search": {
              "vector_store_ids": [],
            },
          },
          "tools": [
            {
              "type": "file_search",
            },
          ],
          "top_p": 1,
        }
      `);
    });
  });
});
