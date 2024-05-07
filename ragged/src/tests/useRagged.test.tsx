/**
 * @jest-environment jsdom
 */

// Polyfilling TextEncoder and TextDecoder
// https://stackoverflow.com/questions/68468203/why-am-i-getting-textencoder-is-not-defined-in-jest
import { TextEncoder, TextDecoder } from "util";
Object.assign(global, { TextDecoder, TextEncoder });

// polyfill structuredClone
Object.assign(global, {
    structuredClone: (x: any) => JSON.parse(JSON.stringify(x)),
});

// polyfill fetch
import "openai/shims/node";

import openaiSimpleChatJson from "./openai.simple-chat.json";
import { render, act, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { MockOpenAI } from "./MockOpenAi";
import { RaggedConfiguration } from "../types";

describe("useRagged", () => {
    describe("instantiation", () => {
        beforeEach(async () => {
            jest.mock("openai", () => {
                return MockOpenAI.withChoices(openaiSimpleChatJson);
            });
        });

        it("should start with a clean state", async () => {
            let TestComponent = (await import("./UseRaggedTestComponent"))
                .UseRaggedTestComponent;

            act(() => {
                const x = render(
                    <TestComponent
                        useRaggedProps={
                            {
                                provider: "openai",
                                config: {
                                    apiKey: "test-api-key",
                                    dangerouslyAllowBrowser: true,
                                },
                            } as RaggedConfiguration
                        }
                    />
                );
            });

            expect(
                screen.getByTestId("chat-history").textContent
            ).toMatchInlineSnapshot(`"[]"`);
            expect(
                screen.getByTestId("live-response").textContent
            ).toMatchInlineSnapshot(`""`);
        });

        it("should fill history.", async () => {
            jest.useFakeTimers();
            let TestComponent = (await import("./UseRaggedTestComponent"))
                .UseRaggedTestComponent;

            act(() => {
                render(
                    <TestComponent
                        useRaggedProps={
                            {
                                provider: "openai",
                                config: {
                                    apiKey: "test-api-key",
                                    dangerouslyAllowBrowser: true,
                                },
                            } as RaggedConfiguration
                        }
                    />
                );
            });

            await act(async () => {
                userEvent.click(screen.getByTestId("user-input"));
                await jest.runAllTimersAsync();
                userEvent.keyboard("Hello, AI");
                await jest.runAllTimersAsync();
                userEvent.click(screen.getByRole("button", { name: /Submit/i }));
                await jest.runAllTimersAsync();
            });

            // await new Promise((resolve) => setTimeout(resolve, 100));

            expect(
                screen.getByTestId("chat-history").textContent
            ).toMatchInlineSnapshot(
                `"[{"type":"history.text","role":"human","data":{"text":"Hello, AI"}},{"type":"history.text","role":"ai","data":{"text":"Toronto is the capital city of the province of Ontario in Canada. It is the largest city in Canada and is known for its diverse culture, thriving arts scene, and bustling downtown core. Toronto is also a major financial and business hub in North America."}}]"`
            );

            // make sure the live response is empty
            expect(
                screen.getByTestId("live-response").textContent
            ).toMatchInlineSnapshot(`""`);
        });
    });
});
