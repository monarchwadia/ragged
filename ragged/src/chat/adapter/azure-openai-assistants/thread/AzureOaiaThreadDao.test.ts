import { startPollyRecording } from "../../../../test/startPollyRecording";
import { ApiClient } from "../../../../support/ApiClient";
import { AzureOaiaThreadDao } from "./AzureOaiaThreadDao";

let apiKey = process.env.AZURE_OPENAI_ASSISTANTS_API_KEY || "";
let apiVersion = process.env.AZURE_OPENAI_ASSISTANTS_API_VERSION || "";
let resourceName = process.env.AZURE_OPENAI_ASSISTANTS_RESOURCE_NAME || "";
let deploymentName = process.env.AZURE_OPENAI_ASSISTANTS_DEPLOYMENT_NAME || "";
let modelName = process.env.AZURE_OPENAI_ASSISTANTS_MODEL_NAME || "";

describe("AzureOaiaThreadDao", () => {
  describe("createThread", () => {
    it.skip("can be created", async () => {
      const apiClient = new ApiClient();
      const oaiaThreadDao = new AzureOaiaThreadDao({
        apiKey,
        resourceName,
        deploymentName,
        apiVersion,
        modelName,
      });

      const polly = startPollyRecording(
        "AzureOaiaThreadDao > createThread > can be created"
      );

      const thread = await oaiaThreadDao.createThread(apiClient);

      await polly.stop();

      expect(thread).toMatchInlineSnapshot(`
        {
          "created_at": 1719582469,
          "id": "thread_0Oq7b8NlD8gayMrM9huQyv21",
          "metadata": {},
          "object": "thread",
          "tool_resources": {},
        }
      `);
    });
  });
});
