import { startPollyRecording } from "../../../../test/startPollyRecording";
import { ApiClient } from "../../../../support/ApiClient";
import { AzureOaiaMessageDao } from "../message/AzureOaiaMessageDao";
import { AzureOaiaThreadDao } from "../thread/AzureOaiaThreadDao";
import { AzureOaiaRunDao } from "./AzureOaiaRunDao";
import { AzureOaiaDao } from "../assistant/AzureOaiaAssistantDao";
import { AzureOaiaDaoCommonConfig } from "../Dao.types";

let apiKey = process.env.AZURE_OPENAI_ASSISTANTS_API_KEY || "";
let apiVersion = process.env.AZURE_OPENAI_ASSISTANTS_API_VERSION || "";
let resourceName = process.env.AZURE_OPENAI_ASSISTANTS_RESOURCE_NAME || "";
let deploymentName = process.env.AZURE_OPENAI_ASSISTANTS_DEPLOYMENT_NAME || "";
let modelName = process.env.AZURE_OPENAI_ASSISTANTS_MODEL_NAME || "";

describe("OaiaRunDaoDao", () => {
  describe("createRun", () => {
    it.skip("can be created", async () => {
      const config: AzureOaiaDaoCommonConfig = {
        apiKey,
        resourceName,
        deploymentName,
        apiVersion,
        modelName,
      };
      const apiClient = new ApiClient();
      const oaiaAssistantDao = new AzureOaiaDao(apiClient, config);
      const oaiaMessageDao = new AzureOaiaMessageDao(apiClient, config);
      const oaiaThreadDao = new AzureOaiaThreadDao(apiClient, config);
      const oaiaRunDao = new AzureOaiaRunDao(apiClient, config);

      const polly = startPollyRecording(
        "AzureOaiaRunDao > createRun > can be created",
        {
          matchRequestsBy: {
            order: true,
          },
        }
      );

      const assistant = await oaiaAssistantDao.createAssistant({
        name: "assistantName",
        description: "assistantDescription",
        model: modelName,
        instructions: "talk funny",
        tools: [],
      });

      const thread = await oaiaThreadDao.createThread();

      await oaiaMessageDao.createMessage({
        threadId: thread.id,
        body: {
          role: "user",
          content:
            "I need to solve the equation `3x + 11 = 14`. Can you help me?",
        },
      });

      const run = await oaiaRunDao.createRun({
        threadId: thread.id,
        assistant_id: assistant.id,
      });

      await polly.stop();

      expect(run).toMatchInlineSnapshot(`
        {
          "assistant_id": "asst_SwmJGuBWJAZBGN7snbBBJRwQ",
          "cancelled_at": null,
          "completed_at": null,
          "created_at": 1719582609,
          "expires_at": 1719583209,
          "failed_at": null,
          "id": "run_Os4nKnRAdM4RwUJjgPRwoyBZ",
          "incomplete_details": null,
          "instructions": "talk funny",
          "last_error": null,
          "max_completion_tokens": null,
          "max_prompt_tokens": null,
          "metadata": {},
          "model": "cadstromgpt4",
          "object": "thread.run",
          "required_action": null,
          "response_format": "auto",
          "started_at": null,
          "status": "queued",
          "temperature": 1,
          "thread_id": "thread_1fXikpWU4Lb4oNqE4cRYyJ44",
          "tool_choice": "auto",
          "tool_resources": {},
          "tools": [],
          "top_p": 1,
          "truncation_strategy": {
            "last_messages": null,
            "type": "auto",
          },
          "usage": null,
        }
      `);
    });
  });
});
