import {
  ChatCompletionDetector,
  ChatCompletionDetectorEvent,
} from "./ChatCompletionDetector";
// This is a test file for ChatCompletionDetector that contains the events streamed from a simple OpenAI gpt-3.5 call
import streamInput from "./ChatCompletionDetector.test.json";

describe("ChatCompletionDetector", () => {
  it("CHAT_COMPLETION_START should be accurate", () => {
    let firstEvent: ChatCompletionDetectorEvent | null = null;
    const detector = new ChatCompletionDetector();
    detector.listen((evt) => {
      if (!firstEvent) {
        firstEvent = evt;
      }
    });
    for (const obj of streamInput) {
      detector.scan(obj);
    }
    expect(firstEvent).toEqual({
      type: "CHAT_COMPLETION_START",
      index: 0,
    });
  });
  it("CHAT_COMPLETION_FINISH should be accurate", () => {
    let completedEvent;
    const detector = new ChatCompletionDetector();
    detector.listen((evt) => {
      if (evt.type === "CHAT_COMPLETION_FINISH") {
        completedEvent = evt;
      }
    });
    for (const obj of streamInput) {
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
    let collectEvents: ChatCompletionDetectorEvent[] = [];
    const detector = new ChatCompletionDetector();
    detector.listen((evt) => {
      if (evt.type === "CHAT_COMPLETION_COLLECT") {
        collectEvents.push(evt);
      }
    });
    for (const obj of streamInput) {
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
    let collectEvents: ChatCompletionDetectorEvent[] = [];
    const detector = new ChatCompletionDetector();
    detector.listen((evt) => {
      if (evt.type === "CHAT_COMPLETION_CHUNK") {
        collectEvents.push(evt);
      }
    });
    for (const obj of streamInput) {
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
      content: undefined,
    });
  });
});
