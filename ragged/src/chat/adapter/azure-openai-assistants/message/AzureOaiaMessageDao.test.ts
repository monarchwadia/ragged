import { startPollyRecording } from "../../../../test/startPollyRecording";
import { ApiClient } from "../../../../support/ApiClient";
import { AzureOaiaMessageDao } from "./AzureOaiaMessageDao";
import { AzureOaiaThreadDao } from "../thread/AzureOaiaThreadDao";
import { AzureOaiaDaoCommonConfig } from "../Dao.types";

let apiKey = process.env.AZURE_OPENAI_ASSISTANTS_API_KEY || "";
let apiVersion = process.env.AZURE_OPENAI_ASSISTANTS_API_VERSION || "";
let resourceName = process.env.AZURE_OPENAI_ASSISTANTS_RESOURCE_NAME || "";
let deploymentName = process.env.AZURE_OPENAI_ASSISTANTS_DEPLOYMENT_NAME || "";
let modelName = process.env.AZURE_OPENAI_ASSISTANTS_MODEL_NAME || "";

describe("OaiaMessageDao", () => {
  describe("createMessage", () => {
    it.skip("can be created", async () => {
      const config: AzureOaiaDaoCommonConfig = {
        apiKey,
        resourceName,
        deploymentName,
        apiVersion,
        modelName,
      };
      const apiClient = new ApiClient();
      const oaiaMessageDao = new AzureOaiaMessageDao(config);
      const oaiaThreadDao = new AzureOaiaThreadDao(config);

      const polly = startPollyRecording(
        "AzureOaiaMessageDao > createMessage > can be created",
        {
          matchRequestsBy: {
            order: true,
          },
        }
      );

      const thread = await oaiaThreadDao.createThread(apiClient);

      const message = await oaiaMessageDao.createMessage(
        apiClient,
        {
          threadId: thread.id,
          body: {
            role: "user",
            content:
              "I need to solve the equation `3x + 11 = 14`. Can you help me?",
          },
        });

      await polly.stop();

      expect(message).toMatchInlineSnapshot(`
        {
          "assistant_id": null,
          "attachments": [],
          "content": [
            {
              "text": {
                "annotations": [],
                "value": "I need to solve the equation \`3x + 11 = 14\`. Can you help me?",
              },
              "type": "text",
            },
          ],
          "created_at": 1719418287,
          "id": "msg_UV2AMX9HH4pUUtl3niNRqRUF",
          "metadata": {},
          "object": "thread.message",
          "role": "user",
          "run_id": null,
          "thread_id": "thread_z22YIbUVALbEOUwUodiej9TB",
        }
      `);
    });
  });

  describe("list messages for thread", () => {
    it.skip("can be listed", async () => {
      const config: AzureOaiaDaoCommonConfig = {
        apiKey,
        resourceName,
        deploymentName,
        apiVersion,
        modelName,
      };
      const apiClient = new ApiClient();
      const oaiaMessageDao = new AzureOaiaMessageDao(config);
      const oaiaThreadDao = new AzureOaiaThreadDao(config);

      const polly = startPollyRecording(
        "AzureOaiaMessageDao > list messages for thread > can be listed",
        {
          matchRequestsBy: {
            order: true,
          },
        }
      );

      const thread = await oaiaThreadDao.createThread(apiClient);

      await oaiaMessageDao.createMessage(
        apiClient,
        {
          threadId: thread.id,
          body: {
            role: "user",
            content:
              "I need to solve the equation `3x + 11 = 14`. Can you help me?",
          },
        });

      const messages = await oaiaMessageDao.listMessagesForThread(apiClient, thread.id);

      await polly.stop();

      expect(messages).toMatchInlineSnapshot(`
        {
          "data": [
            {
              "assistant_id": null,
              "attachments": [],
              "content": [
                {
                  "text": {
                    "annotations": [],
                    "value": "I need to solve the equation \`3x + 11 = 14\`. Can you help me?",
                  },
                  "type": "text",
                },
              ],
              "created_at": 1719582630,
              "id": "msg_KGIuIQH7xkHoBonA2yL1w9s7",
              "metadata": {},
              "object": "thread.message",
              "role": "user",
              "run_id": null,
              "thread_id": "thread_x9PWUV0p72hyRy26SMWJ9B27",
            },
          ],
          "first_id": "msg_KGIuIQH7xkHoBonA2yL1w9s7",
          "has_more": false,
          "last_id": "msg_KGIuIQH7xkHoBonA2yL1w9s7",
          "object": "list",
        }
      `);
    });
  });
});
