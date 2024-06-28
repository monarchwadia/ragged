import { startPollyRecording } from "../../../../test/startPollyRecording";
import { ApiClient } from "../../../../support/ApiClient";
import { OaiaMessageDao } from "./OaiaMessageDao";
import { OaiaThreadDao } from "../thread/OaiaThreadDao";

describe("OaiaMessageDao", () => {
  describe("createMessage", () => {
    it("can be created", async () => {
      const apiClient = new ApiClient();
      const oaiaMessageDao = new OaiaMessageDao(apiClient);
      const oaiaThreadDao = new OaiaThreadDao(apiClient);

      const polly = startPollyRecording(
        "OaiaMessageDao > createMessage > can be created"
      );

      const thread = await oaiaThreadDao.createThread(
        process.env.OPENAI_API_KEY as string
      );

      const message = await oaiaMessageDao.createMessage(
        process.env.OPENAI_API_KEY as string,
        {
          threadId: thread.id,
          body: {
            role: "user",
            content:
              "I need to solve the equation `3x + 11 = 14`. Can you help me?",
          },
        }
      );

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
      const apiClient = new ApiClient();
      const oaiaMessageDao = new OaiaMessageDao(apiClient);
      const oaiaThreadDao = new OaiaThreadDao(apiClient);

      const polly = startPollyRecording(
        "OaiaMessageDao > list messages for thread > can be listed",
        {
          matchRequestsBy: {
            order: true,
          },
        }
      );

      const thread = await oaiaThreadDao.createThread(
        process.env.OPENAI_API_KEY as string
      );

      await oaiaMessageDao.createMessage(process.env.OPENAI_API_KEY as string, {
        threadId: thread.id,
        body: {
          role: "user",
          content:
            "I need to solve the equation `3x + 11 = 14`. Can you help me?",
        },
      });

      const messages = await oaiaMessageDao.listMessagesForThread(
        process.env.OPENAI_API_KEY as string,
        thread.id
      );

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
              "created_at": 1719582779,
              "id": "msg_QdF70aDQN4EMld9ithuE8evu",
              "metadata": {},
              "object": "thread.message",
              "role": "user",
              "run_id": null,
              "thread_id": "thread_cPW7rYOHoQ7Fp5upGu5QKAef",
            },
          ],
          "first_id": "msg_QdF70aDQN4EMld9ithuE8evu",
          "has_more": false,
          "last_id": "msg_QdF70aDQN4EMld9ithuE8evu",
          "object": "list",
        }
      `);
    });
  });
});
