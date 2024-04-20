import {
  OpenAiChatCompletionDetector,
  OpenAiChatCompletionDetectorEvent,
} from "./OpenAiChatCompletionDetector";
// This is a test file for ChatCompletionDetector that contains the events streamed from a simple OpenAI gpt-3.5 call
import chatStreamInput from "./OpenAiChatCompletionDetector.test.json";
import toolUseStreamInput from "./OpenAiToolUseCompletionDetector.test.json";

describe("ChatCompletionDetector", () => {
  it("CHAT_COMPLETION_START should be accurate", () => {
    let firstEvent: OpenAiChatCompletionDetectorEvent | null = null;
    const detector = new OpenAiChatCompletionDetector();
    detector.listen((evt) => {
      if (!firstEvent) {
        firstEvent = evt;
      }
    });
    for (const obj of chatStreamInput) {
      detector.scan(obj);
    }
    expect(firstEvent).toEqual({
      type: "CHAT_COMPLETION_START",
      index: 0,
    });
  });
  it("CHAT_COMPLETION_FINISH should be accurate without tool use", () => {
    let completedEvent;
    const detector = new OpenAiChatCompletionDetector();
    detector.listen((evt) => {
      if (evt.type === "CHAT_COMPLETION_FINISH") {
        completedEvent = evt;
      }
    });
    for (const obj of chatStreamInput) {
      detector.scan(obj);
    }

    expect(completedEvent).toEqual({
      type: "CHAT_COMPLETION_FINISH",
      index: 0,
      content:
        "Toronto is the capital city of the province of Ontario in Canada. It is the largest city in Canada and is known for its diverse culture, thriving arts scene, and bustling downtown core. Toronto is also a major financial and business hub in North America.",
    });
  });

  it("CHAT_COMPLETION_COLLECT should be accurate", () => {
    let collectEvents: OpenAiChatCompletionDetectorEvent[] = [];
    const detector = new OpenAiChatCompletionDetector();
    detector.listen((evt) => {
      if (evt.type === "CHAT_COMPLETION_COLLECT") {
        collectEvents.push(evt);
      }
    });
    for (const obj of chatStreamInput) {
      detector.scan(obj);
    }
    expect(collectEvents[0]).toEqual({
      type: "CHAT_COMPLETION_COLLECT",
      index: 0,
      content: "",
    });
    expect(collectEvents[1]).toEqual({
      type: "CHAT_COMPLETION_COLLECT",
      index: 0,
      content: "Toronto",
    });
    expect(collectEvents[51]).toEqual({
      type: "CHAT_COMPLETION_COLLECT",
      index: 0,
      content:
        "Toronto is the capital city of the province of Ontario in Canada. It is the largest city in Canada and is known for its diverse culture, thriving arts scene, and bustling downtown core. Toronto is also a major financial and business hub in North America.",
    });
  });
  it("CHAT_COMPLETION_CHUNK should be accurate", () => {
    let collectEvents: OpenAiChatCompletionDetectorEvent[] = [];
    const detector = new OpenAiChatCompletionDetector();
    detector.listen((evt) => {
      if (evt.type === "CHAT_COMPLETION_CHUNK") {
        collectEvents.push(evt);
      }
    });
    for (const obj of chatStreamInput) {
      detector.scan(obj);
    }
    expect(collectEvents[0]).toEqual({
      type: "CHAT_COMPLETION_CHUNK",
      index: 0,
      content: "",
    });
    expect(collectEvents[1]).toEqual({
      type: "CHAT_COMPLETION_CHUNK",
      index: 0,
      content: "Toronto",
    });
    expect(collectEvents[2]).toEqual({
      type: "CHAT_COMPLETION_CHUNK",
      index: 0,
      content: " is",
    });
    expect(collectEvents[51]).toEqual({
      type: "CHAT_COMPLETION_CHUNK",
      index: 0,
      content: "", // note, this is an empty string because the delta.content is null
    });
  });

  it("TOOL_USE_START should work as expected", () => {
    const detector = new OpenAiChatCompletionDetector();

    let firstToolUseEvent: OpenAiChatCompletionDetectorEvent | undefined =
      undefined;

    detector.listen((evt) => {
      if (evt.type === "TOOL_USE_START" && !firstToolUseEvent) {
        firstToolUseEvent = evt;
      }
    });

    for (const obj of toolUseStreamInput) {
      detector.scan(obj);
    }

    expect(firstToolUseEvent).toEqual({
      index: 0,
      toolCallIndex: 0,
      type: "TOOL_USE_START",
      toolCall: {
        name: "adder",
      },
    });
  });

  it("TOOL_USE_FINISH should work as expected", () => {
    const detector = new OpenAiChatCompletionDetector();

    let lastToolUseEvent: OpenAiChatCompletionDetectorEvent | undefined =
      undefined;

    detector.listen((evt) => {
      if (evt.type === "TOOL_USE_FINISH") {
        lastToolUseEvent = evt;
      }
    });

    for (const obj of toolUseStreamInput) {
      detector.scan(obj);
    }

    expect(lastToolUseEvent).toEqual({
      index: 0,
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

  it("CHAT_COMPLETION_FINISH, with tool use, should be accurate", () => {
    let completedEvent;
    const detector = new OpenAiChatCompletionDetector();
    detector.listen((evt) => {
      if (evt.type === "CHAT_COMPLETION_FINISH") {
        completedEvent = evt;
      }
    });
    for (const obj of toolUseStreamInput) {
      detector.scan(obj);
    }

    expect(completedEvent).toEqual({
      type: "CHAT_COMPLETION_FINISH",
      index: 0,
      content: "",
      toolCalls: [
        {
          name: "adder",
          arguments: {
            a: 1,
            b: 1,
          },
        },
      ],
    });
  });
});
