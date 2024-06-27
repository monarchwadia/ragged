import { startPollyRecording } from "../../../../test/startPollyRecording";
import { ApiClient } from "../../../../support/ApiClient";
import { AzureOaiaThreadDao } from "./AzureOaiaThreadDao";

let apiKey = process.env.AZURE_OPENAI_ASSISTANTS_API_KEY || "";
let apiVersion = process.env.AZURE_OPENAI_ASSISTANTS_API_VERSION || "";
let resourceName = process.env.AZURE_OPENAI_ASSISTANTS_RESOURCE_NAME || "";
let deploymentName = process.env.AZURE_OPENAI_ASSISTANTS_DEPLOYMENT_NAME || "";

describe("OaiaThreadDao", () => {
  describe("createThread", () => {
    it("can be created", async () => {
      const apiClient = new ApiClient();
      const oaiaThreadDao = new AzureOaiaThreadDao(apiClient, {
        apiKey,
        resourceName,
        deploymentName,
        apiVersion,
      });

      const polly = startPollyRecording(
        "OaiaThreadDao > createThread > can be created"
      );

      const thread = await oaiaThreadDao.createThread();

      await polly.stop();

      expect(thread).toMatchInlineSnapshot(`
        {
          "created_at": 1719501756,
          "id": "thread_yIOJW31QTvogrAasaWf851nR",
          "metadata": {},
          "object": "thread",
          "tool_resources": {},
        }
      `);
    });
  });
});
