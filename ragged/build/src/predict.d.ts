import { Subject } from "rxjs";
import type { OpenAI } from "openai";
type LlmStreamEventWithPayload = {
    type: "collected" | "finished";
    payload: string;
};
type LlmStreamEventWithoutPayload = {
    type: "started";
};
type LlmStreamEvent = LlmStreamEventWithPayload | LlmStreamEventWithoutPayload;
export declare const predict: (o: OpenAI, prompt: string) => Subject<LlmStreamEvent>;
export declare const qPredict: (o: OpenAI, text: string) => Promise<string>;
export {};
