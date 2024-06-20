import { startPollyRecording } from "../../../../test/startPollyRecording";
import { ApiClient } from "../../../support/ApiClient";
import { OaiaMessageDao } from "./OaiaMessageDao";
import { OaiaThreadDao } from "./OaiaThreadDao";

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
          "created_at": 1718855627,
          "id": "msg_tHSpPQd1QYa6HxTpz2PUYUOa",
          "metadata": {},
          "object": "thread.message",
          "role": "user",
          "run_id": null,
          "thread_id": "thread_SlgOqT6RhHESfg0aZgClcXsY",
        }
      `);
    });
  });
});
