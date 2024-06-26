import { startPollyRecording } from "../../../../test/startPollyRecording";
import { ApiClient } from "../../../../support/ApiClient";
import { AzureOaiaDao } from "./AzureOaiaAssistantDao";

let apiKey = process.env.AZURE_OPENAI_ASSISTANTS_API_KEY || "";
let apiVersion = process.env.AZURE_OPENAI_ASSISTANTS_API_VERSION || "";
let resourceName = process.env.AZURE_OPENAI_ASSISTANTS_RESOURCE_NAME || "";
let deploymentName = process.env.AZURE_OPENAI_ASSISTANTS_DEPLOYMENT_NAME || "";

describe("AzureOaiaDao", () => {
  describe("createAssistant", () => {
    it("can be created", async () => {
      const apiClient = new ApiClient();
      const azureOaiaDao = new AzureOaiaDao(apiClient, {
        apiKey,
        resourceName,
        deploymentName,
        apiVersion
      });

      const polly = startPollyRecording(
        "AzureOaiaDao > createAssistant > can be created"
      );

      const assistant = await azureOaiaDao.createAssistant(
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
