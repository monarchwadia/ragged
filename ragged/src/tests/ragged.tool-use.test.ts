import { MockOpenAI } from "./MockOpenAi";
import openaiToolUseJson from "./openai.tool-use.json";

describe("ragged.tool-use", () => {
    it("correctly handles tool use", async () => {
        jest.mock("openai", () => {
            return MockOpenAI.withChoices(openaiToolUseJson);
        });

        const { Ragged } = await import("../../main");

        const r = new Ragged({
            provider: "openai",
            config: {
                apiKey: "fake-api-key",
            },
        });

        const toolFinished = await r.chat("").first("tool.finished");

        expect(toolFinished).toMatchInlineSnapshot(`undefined`);
    });
});
