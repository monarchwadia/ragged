import { MockOpenAI } from "./MockOpenAi";
import openaiToolUseJson from "./openai.tool-use.json";

describe("ragged.tool-use", () => {
  it("correctly detects tool.inputs", async () => {
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

    const toolInputs = await r.chat("").first("tool.inputs");

    // We expect the tool to finish
    expect(toolInputs).toMatchInlineSnapshot(`
      {
        "data": {
          "arguments": {
            "a": 1,
            "b": 1,
          },
          "name": "adder",
        },
        "index": 0,
        "toolCallIndex": 0,
        "type": "tool.inputs",
      }
    `);
  });

  it("has `undefined` for results if the tool was not provided", async () => {
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

    // We expect the tool to finish
    expect(toolFinished).toMatchInlineSnapshot(`
      {
        "data": {
          "arguments": {
            "a": 1,
            "b": 1,
          },
          "name": "adder",
          "result": undefined,
        },
        "index": 0,
        "toolCallIndex": 0,
        "type": "tool.finished",
      }
    `);
  });
});
