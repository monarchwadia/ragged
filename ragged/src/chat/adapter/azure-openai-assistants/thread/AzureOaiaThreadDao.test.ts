import { startPollyRecording } from "../../../../test/startPollyRecording";
import { ApiClient } from "../../../../support/ApiClient";
import { OaiaThreadDao } from "./AzureOaiaThreadDao";


let apiKey = process.env.AZURE_OPENAI_API_KEY || "";
let apiVersion = process.env.AZURE_OPENAI_API_VERSION || "";
let resourceName = process.env.AZURE_OPENAI_RESOURCE_NAME || "";
let deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "";

describe("OaiaThreadDao", () => {
  describe("createThread", () => {
    it("can be created", async () => {
      const apiClient = new ApiClient();
      const oaiaThreadDao = new OaiaThreadDao(apiClient, {
        apiKey: process.env.OPENAI_API_KEY as string,
        resourceName,
        deploymentName,
        apiVersion
      });

      const polly = startPollyRecording(
        "OaiaThreadDao > createThread > can be created"
      );

      const thread = await oaiaThreadDao.createThread();

      polly.stop();

      expect(thread).toMatchInlineSnapshot(`
        {
          "created_at": 1718855111,
          "id": "thread_mGG7FJ133ssPowO2UisHkL3h",
          "metadata": {},
          "object": "thread",
          "tool_resources": {},
        }
      `);
    });
  });
});
