import { startPollyRecording } from "../../../../test/startPollyRecording";
import { ApiClient } from "../../../../support/ApiClient";
import { AzureOaiaMessageDao } from "./AzureOaiaMessageDao";
import { AzureOaiaThreadDao } from "../thread/AzureOaiaThreadDao";
import { AzureOaiaDaoCommonConfig } from "../Dao.types";

let apiKey = process.env.AZURE_OPENAI_ASSISTANTS_API_KEY || "";
let apiVersion = process.env.AZURE_OPENAI_ASSISTANTS_API_VERSION || "";
let resourceName = process.env.AZURE_OPENAI_ASSISTANTS_RESOURCE_NAME || "";
let deploymentName = process.env.AZURE_OPENAI_ASSISTANTS_DEPLOYMENT_NAME || "";

describe("OaiaMessageDao", () => {
  describe("createMessage", () => {
    it("can be created", async () => {
      const config: AzureOaiaDaoCommonConfig = {
        apiKey,
        resourceName,
        deploymentName,
        apiVersion,
      };
      const apiClient = new ApiClient();
      const oaiaMessageDao = new AzureOaiaMessageDao(apiClient, config);
      const oaiaThreadDao = new AzureOaiaThreadDao(apiClient, config);

      const polly = startPollyRecording(
        "AzureOaiaMessageDao > createMessage > can be created"
      );

      const thread = await oaiaThreadDao.createThread();

      const message = await oaiaMessageDao.createMessage({
        threadId: thread.id,
        body: {
          role: "user",
          content:
            "I need to solve the equation `3x + 11 = 14`. Can you help me?",
        },
      });

      polly.stop();

      expect(message).toMatchInlineSnapshot(`
        {
          "assistant_id": null,
          "content": [
            {
              "text": {
                "annotations": [],
                "value": "I need to solve the equation \`3x + 11 = 14\`. Can you help me?",
              },
              "type": "text",
            },
          ],
          "created_at": 1719370696,
          "file_ids": [],
          "id": "msg_uWVqYRXLUueeqYsTTRaCwofj",
          "metadata": {},
          "object": "thread.message",
          "role": "user",
          "run_id": null,
          "thread_id": "thread_Bv4xUPhud36io4zgBJZZdRK8",
        }
      `);
    });
  });

  describe("list messages for thread", () => {
    it("can be listed", async () => {
      const config: AzureOaiaDaoCommonConfig = {
        apiKey,
        resourceName,
        deploymentName,
        apiVersion,
      };
      const apiClient = new ApiClient();
      const oaiaMessageDao = new AzureOaiaMessageDao(apiClient, config);
      const oaiaThreadDao = new AzureOaiaThreadDao(apiClient, config);

      const polly = startPollyRecording(
        "OaiaMessageDao > list messages for thread > can be listed"
      );

      const thread = await oaiaThreadDao.createThread();

      await oaiaMessageDao.createMessage({
        threadId: thread.id,
        body: {
          role: "user",
          content:
            "I need to solve the equation `3x + 11 = 14`. Can you help me?",
        },
      });

      const messages = await oaiaMessageDao.listMessagesForThread(thread.id);

      polly.stop();

      expect(messages).toMatchInlineSnapshot(`
        {
          "data": [
            {
              "assistant_id": null,
              "content": [
                {
                  "text": {
                    "annotations": [],
                    "value": "I need to solve the equation \`3x + 11 = 14\`. Can you help me?",
                  },
                  "type": "text",
                },
              ],
              "created_at": 1719371073,
              "file_ids": [],
              "id": "msg_ok8NirkUnSJDa5JHob4tj50Y",
              "metadata": {},
              "object": "thread.message",
              "role": "user",
              "run_id": null,
              "thread_id": "thread_HCiQG0leC6VTQeiYnvqj4qmp",
            },
          ],
          "first_id": "msg_ok8NirkUnSJDa5JHob4tj50Y",
          "has_more": false,
          "last_id": "msg_ok8NirkUnSJDa5JHob4tj50Y",
          "object": "list",
        }
      `);
    });
  });
});
