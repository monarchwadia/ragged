import { startPollyRecording } from "../../../../test/startPollyRecording";
import { ApiClient } from "../../../support/ApiClient";
import { OaiaMessageDao } from "./OaiaMessageDao";
import { OaiaThreadDao } from "./OaiaThreadDao";
import { OaiaRunDao } from "./OaiaRunDao";
import { OaiaAssistantDao } from "./OaiaAssistantDao";

describe("OaiaRunDaoDao", () => {
  describe("createRun", () => {
    it("can be created", async () => {
      const apiClient = new ApiClient();
      const oaiaAssistantDao = new OaiaAssistantDao(apiClient);
      const oaiaMessageDao = new OaiaMessageDao(apiClient);
      const oaiaThreadDao = new OaiaThreadDao(apiClient);
      const oaiaRunDao = new OaiaRunDao(apiClient);

      const polly = startPollyRecording(
        "OaiaRunDao > createRun > can be created"
      );

      const assistant = await oaiaAssistantDao.createAssistant(
        process.env.OPENAI_API_KEY as string,
        {
          name: "assistantName",
          description: "assistantDescription",
          model: "gpt-3.5-turbo",
          instructions: "talk funny",
          tools: [],
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

      const run = await oaiaRunDao.createRun(
        process.env.OPENAI_API_KEY as string,
        {
          threadId: thread.id,
          body: {
            assistant_id: assistant.id,
            instructions:
              "I need to solve the equation `3x + 11 = 14`. Can you help me?",
          },
        }
      );

      polly.stop();

      expect(run).toMatchInlineSnapshot(`
        {
          "assistant_id": "asst_rLTm0LCjqA2vPolP579uAaD0",
          "cancelled_at": null,
          "completed_at": null,
          "created_at": 1718857836,
          "expires_at": 1718858436,
          "failed_at": null,
          "id": "run_9XQzr1lXBN0B0W3WxNGvG1YV",
          "incomplete_details": null,
          "instructions": "I need to solve the equation \`3x + 11 = 14\`. Can you help me?",
          "last_error": null,
          "max_completion_tokens": null,
          "max_prompt_tokens": null,
          "metadata": {},
          "model": "gpt-3.5-turbo",
          "object": "thread.run",
          "parallel_tool_calls": true,
          "required_action": null,
          "response_format": "auto",
          "started_at": null,
          "status": "queued",
          "temperature": 1,
          "thread_id": "thread_tYtMyOfMHetTpXaJosgJbn5H",
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
