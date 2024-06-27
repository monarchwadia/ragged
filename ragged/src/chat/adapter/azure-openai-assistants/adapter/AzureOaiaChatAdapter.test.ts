import { startPollyRecording } from "../../../../test/startPollyRecording";
import { ApiClient } from "../../../../support/ApiClient";
import { AzureOaiaDao } from "../assistant/AzureOaiaAssistantDao";
import { AzureOaiaMessageDao } from "../message/AzureOaiaMessageDao";
import { AzureOaiaRunDao } from "../run/AzureOaiaRunDao";
import { AzureOaiaThreadDao } from "../thread/AzureOaiaThreadDao";
import { AzureOaiaChatAdapter } from "./AzureOaiaChatAdapter";
import { AzureOaiaDaoCommonConfig } from "../Dao.types";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";

const apiKey = process.env.AZURE_OPENAI_ASSISTANTS_API_KEY || "";
const apiVersion = process.env.AZURE_OPENAI_ASSISTANTS_API_VERSION || "";
const resourceName = process.env.AZURE_OPENAI_ASSISTANTS_RESOURCE_NAME || "";
const deploymentName =
  process.env.AZURE_OPENAI_ASSISTANTS_DEPLOYMENT_NAME || "";
const modelName = process.env.AZURE_OPENAI_ASSISTANTS_MODEL_NAME || "";

describe("AzureOaiaChatAdapter", () => {
  let apiClient: DeepMockProxy<ApiClient>;
  let assistantDao: DeepMockProxy<AzureOaiaDao>;
  let threadDao: DeepMockProxy<AzureOaiaThreadDao>;
  let messageDao: DeepMockProxy<AzureOaiaMessageDao>;
  let runDao: DeepMockProxy<AzureOaiaRunDao>;
  let adapter: AzureOaiaChatAdapter;

  beforeEach(() => {
    apiClient = mockDeep<ApiClient>();
    assistantDao = mockDeep<AzureOaiaDao>();
    threadDao = mockDeep<AzureOaiaThreadDao>();
    messageDao = mockDeep<AzureOaiaMessageDao>();
    runDao = mockDeep<AzureOaiaRunDao>();
  });

  describe("mocked", () => {
    it("uses the modelName in the config to call the api", async () => {
      // @ts-expect-error mock
      threadDao.createThread.mockResolvedValue({ id: "mocked-thread-id" });
      // @ts-expect-error mock
      assistantDao.createAssistant.mockResolvedValue({
        id: "mocked-assistant-id",
      });
      // @ts-expect-error mock
      runDao.createRun.mockResolvedValue({ id: "mocked-run-id" });
      // @ts-expect-error
      runDao.getRun.mockResolvedValue({
        id: "mocked-run-id",
        status: "completed",
      });
      // @ts-expect-error
      messageDao.listMessagesForThread.mockResolvedValue({ data: [] });

      adapter = new AzureOaiaChatAdapter({
        config: {
          apiKey: "mocked-apiKey",
          resourceName: "mocked-resourceName",
          deploymentName: "mocked-deploymentName",
          apiVersion: "mocked-apiVersion",
          modelName: "mocked-modelName",
        },
        assistantDao,
        threadDao,
        messageDao,
        runDao,
      });

      await adapter.chat({
        history: [{ text: "Hello, whats your name?", type: "user" }],
      });

      expect(assistantDao.createAssistant).toHaveBeenCalledWith({
        name: "",
        description: "",
        model: "mocked-modelName",
        instructions: "",
        tools: [],
      });
    });
  });

  describe("with live calls", () => {
    let apiClient: ApiClient;
    let assistantDao: AzureOaiaDao;
    let threadDao: AzureOaiaThreadDao;
    let messageDao: AzureOaiaMessageDao;
    let runDao: AzureOaiaRunDao;
    let adapter: AzureOaiaChatAdapter;

    beforeEach(() => {
      const config: AzureOaiaDaoCommonConfig = {
        apiKey,
        resourceName,
        deploymentName,
        apiVersion,
        modelName,
      };
      apiClient = new ApiClient();
      assistantDao = new AzureOaiaDao(apiClient, config);
      threadDao = new AzureOaiaThreadDao(apiClient, config);
      messageDao = new AzureOaiaMessageDao(apiClient, config);
      runDao = new AzureOaiaRunDao(apiClient, config);

      adapter = new AzureOaiaChatAdapter({
        config,
        assistantDao,
        threadDao,
        messageDao,
        runDao,
      });
    });

    it("can instantiate", () => {
      expect(adapter).toBeDefined();
    });

    it(
      "can chat",
      async () => {
        const polly = startPollyRecording("AzureOaiaChatAdapter > can chat", {
          matchRequestsBy: {
            order: true,
          }
        });

        const response = await adapter.chat({
          history: [{ text: "Hello, whats your name?", type: "user" }],
          model: modelName,
        });

        await polly.stop();

        expect(response).toMatchInlineSnapshot(`
          {
            "history": [
              {
                "text": "Hello! I'm an AI developed by OpenAI called ChatGPT. I don't have a personal name, but you can call me ChatGPT or refer to me however you prefer. How can I assist you today?",
                "type": "bot",
              },
            ],
          }
        `);
      },
      10 * 10000
    );
  });
});
