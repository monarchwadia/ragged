import { startPollyRecording } from "../../../../test/startPollyRecording";
import { ApiClient } from "../../../../support/ApiClient";
import { OaiaThreadDao } from "./OaiaThreadDao";

describe("OaiaThreadDao", () => {
  describe("createThread", () => {
    it("can be created", async () => {
      const apiClient = new ApiClient();
      const oaiaThreadDao = new OaiaThreadDao(apiClient);

      const polly = startPollyRecording(
        "OaiaThreadDao > createThread > can be created"
      );

      const thread = await oaiaThreadDao.createThread(
        process.env.OPENAI_API_KEY as string
      );

      await polly.stop();

      expect(thread).toMatchInlineSnapshot(`
        {
          "created_at": 1719582332,
          "id": "thread_XkMLqZrMjBGNdvhW8EhR3PWA",
          "metadata": {},
          "object": "thread",
          "tool_resources": {},
        }
      `);
    });
  });
});
