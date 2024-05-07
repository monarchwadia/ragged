/**
 * @jest-environment jsdom
 */
// polyfill fetch
import 'openai/shims/node';

// Polyfilling TextEncoder and TextDecoder
// https://stackoverflow.com/questions/68468203/why-am-i-getting-textencoder-is-not-defined-in-jest
// import { TextEncoder, TextDecoder } from "util";
// Object.assign(global, { TextDecoder, TextEncoder });

import openaiSimpleChatJson from "./openai.simple-chat.json";
import { render, act } from "@testing-library/react";
import { MockOpenAI } from "./MockOpenAi";
import { UseRaggedTestComponent } from "./UseRaggedTestComponent";

describe("useRagged", () => {
    describe("instantiation", () => {
        let useRagged;

        // beforeEach(() => {
        //     jest.mock("openai", () => {
        //         return MockOpenAI.withChoices();
        //     });
        // });
        it("should start with a clean state when using a config object", async () => {
            const { useRagged } = await import("../react/useRagged");

            // const x = render(<UseRaggedTestComponent useRaggedProps={{}} />);
            //     useRagged({
            //         provider: "openai",
            //         config: { apiKey: "test-api-key" },
            //     })
            // );

            // expect(result.current.getChatHistory()).toEqual([]);
            // expect(result.current.getLiveResponse()).toEqual(null);
        });

        // it("should start with a clean state when using a config object", async () => {
        //     const { useRagged } = await import("../react/useRagged");

        //     const { result } = renderHook(() =>
        //         useRagged({
        //             provider: "openai",
        //             config: { apiKey: "test-api-key" },
        //         })
        //     );

        //     expect(result.current.getChatHistory()).toEqual([]);
        //     expect(result.current.getLiveResponse()).toEqual(null);
        // });
    });

    describe("basic chat", () => {
        // beforeEach(() => {
        //     jest.mock("openai", () => {
        //         return MockOpenAI.withChoices(openaiSimpleChatJson);
        //     });
        // });

        // it("should be able to send a string message without throwing an error, and parse the response", async () => {
        //     const { useRagged } = await import("../react/useRagged");

        //     const { result } = renderHook(() =>
        //         useRagged({
        //             provider: "openai",
        //             config: { apiKey: "test-api-key" },
        //         })
        //     );

        //     await act(async () => {
        //         result.current.chat("Hello, AI");

        //         await new Promise((r) => setTimeout(r, 10));

        //         expect(result.current.getChatHistory()).toMatchInlineSnapshot(`
        //   [
        //     {
        //       "data": {
        //         "text": "Hello, AI",
        //       },
        //       "role": "human",
        //       "type": "history.text",
        //     },
        //   ]
        // `);
        //     });

        //     expect(result.current.getLiveResponse()).toEqual(null);
        // });
    });
});