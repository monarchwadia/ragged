import { ChatCompletionDetector } from "./ChatCompletionDetector";
// This is a test file for ChatCompletionDetector that contains the events streamed from a simple OpenAI gpt-3.5 call
import streamInput from "./stream-input.json";

describe("ChatCompletionDetector", () => {
  it("should accurately return the chat completion finish", () => {
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
});
