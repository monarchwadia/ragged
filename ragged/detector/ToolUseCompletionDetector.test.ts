import {
  ToolUseCompletionDetector,
  ToolUseDetectorEvent,
} from "./ToolUseCompletionDetector";
// This is a test file for ToolUseCompletionDetector that contains the events streamed from a simple OpenAI gpt-4 call
import streamInput from "./ToolUseCompletionDetector.test.json";

describe("ToolUseCompletionDetector", () => {
  it("TOOL_USE_START should work as expected", () => {
    const detector = new ToolUseCompletionDetector();

    let firstEvent: ToolUseDetectorEvent | undefined = undefined;

    detector.listen((evt) => {
      if (!firstEvent) {
        firstEvent = evt;
      }
    });

    for (const obj of streamInput) {
      detector.scan(obj);
    }

    expect(firstEvent).toEqual({
      choiceIndex: 0,
      toolCallIndex: 0,
      type: "TOOL_USE_START",
      toolCall: {
        name: "adder",
      },
    });
  });

  it("TOOL_USE_FINISH should work as expected", () => {
    const detector = new ToolUseCompletionDetector();

    let lastEvent: ToolUseDetectorEvent | undefined = undefined;

    detector.listen((evt) => {
      lastEvent = evt;
    });

    for (const obj of streamInput) {
      detector.scan(obj);
    }

    expect(lastEvent).toEqual({
      choiceIndex: 0,
      toolCallIndex: 0,
      type: "TOOL_USE_FINISH",
      toolCall: {
        name: "adder",
        arguments: {
          a: 1,
          b: 1,
        },
      },
    });
  });
});
