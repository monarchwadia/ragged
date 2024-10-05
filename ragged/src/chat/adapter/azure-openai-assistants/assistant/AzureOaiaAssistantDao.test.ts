import { startPollyRecording } from "../../../../test/startPollyRecording";
import { ApiClient } from "../../../../support/ApiClient";
import { AzureOaiaDao } from "./AzureOaiaAssistantDao";

let apiKey = process.env.AZURE_OPENAI_ASSISTANTS_API_KEY || "";
let apiVersion = process.env.AZURE_OPENAI_ASSISTANTS_API_VERSION || "";
let resourceName = process.env.AZURE_OPENAI_ASSISTANTS_RESOURCE_NAME || "";
let deploymentName = process.env.AZURE_OPENAI_ASSISTANTS_DEPLOYMENT_NAME || "";
let modelName = process.env.AZURE_OPENAI_ASSISTANTS_MODEL_NAME || "";

describe("AzureOaiaDao", () => {
  describe("createAssistant", () => {
    it.skip("can be created", async () => {
      const apiClient = new ApiClient();
      const azureOaiaDao = new AzureOaiaDao({
        apiKey,
        resourceName,
        deploymentName,
        apiVersion,
        modelName
      });

      const polly = startPollyRecording(
        "AzureOaiaDao > createAssistant > can be created"
      );

      const assistant = await azureOaiaDao.createAssistant(
        apiClient,
        {
          name: "Financial Analyst Assistant",
          instructions:
            "You are an expert financial analyst. Use you knowledge base to answer questions about audited financial statements.",
          tools: [],
          model: modelName,
        });

      await polly.stop();

      expect(assistant).toMatchInlineSnapshot(`
        {
          "created_at": 1719418286,
          "description": null,
          "id": "asst_BK3hMED1CYd68BcebjVbcorB",
          "instructions": "You are an expert financial analyst. Use you knowledge base to answer questions about audited financial statements.",
          "metadata": {},
          "model": "cadstromgpt4",
          "name": "Financial Analyst Assistant",
          "object": "assistant",
          "response_format": "auto",
          "temperature": 1,
          "tool_resources": {},
          "tools": [],
          "top_p": 1,
        }
      `);
    });
  });
});
