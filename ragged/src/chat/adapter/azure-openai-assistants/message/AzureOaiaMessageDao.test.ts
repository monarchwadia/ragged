import { startPollyRecording } from "../../../../test/startPollyRecording";
import { ApiClient } from "../../../../support/ApiClient";
import { OaiaMessageDao } from "./AzureOaiaMessageDao";
import { OaiaThreadDao } from "../thread/AzureOaiaThreadDao";
import { AzureOaiaDaoCommonConfig } from "../Dao.types";

let apiKey = process.env.AZURE_OPENAI_API_KEY || "";
let apiVersion = process.env.AZURE_OPENAI_API_VERSION || "";
let resourceName = process.env.AZURE_OPENAI_RESOURCE_NAME || "";
let deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "";

describe("OaiaMessageDao", () => {
  describe("createMessage", () => {
    it("can be created", async () => {
      const config: AzureOaiaDaoCommonConfig = {
        apiKey,
        resourceName,
        deploymentName,
        apiVersion,
      }
      const apiClient = new ApiClient();
      const oaiaMessageDao = new OaiaMessageDao(apiClient, config);
      const oaiaThreadDao = new OaiaThreadDao(apiClient, config);

      const polly = startPollyRecording(
        "AzureOaiaMessageDao > createMessage > can be created"
      );

      const thread = await oaiaThreadDao.createThread();

      const message = await oaiaMessageDao.createMessage(
        {
          threadId: thread.id,
          body: {
            role: "user",
            content:
              "I need to solve the equation `3x + 11 = 14`. Can you help me?",
          },
        }
      );

      polly.stop();

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
          "created_at": 1718856746,
          "id": "msg_GrLJNcVbzLwCngJMZStb0Bba",
          "metadata": {},
          "object": "thread.message",
          "role": "user",
          "run_id": null,
          "thread_id": "thread_FXkzDdHGZ1SjyDDrkg8g2g7V",
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
      }
      const apiClient = new ApiClient();
      const oaiaMessageDao = new OaiaMessageDao(apiClient, config);
      const oaiaThreadDao = new OaiaThreadDao(apiClient, config);

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
              "created_at": 1718857546,
              "id": "msg_YtpT61EyznDVlevY3jC23Jz8",
              "metadata": {},
              "object": "thread.message",
              "role": "user",
              "run_id": null,
              "thread_id": "thread_Lm2DUXuR7clpazi01Wba9LDF",
            },
          ],
          "first_id": "msg_YtpT61EyznDVlevY3jC23Jz8",
          "has_more": false,
          "last_id": "msg_YtpT61EyznDVlevY3jC23Jz8",
          "object": "list",
        }
      `);
    });
  });
});
