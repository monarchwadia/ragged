/**
 * @jest-environment jsdom
 */

import { renderHook, act } from "@testing-library/react"
import { MockOpenAI } from "./MockOpenAi";
// import { act } from 'react';

describe("useRagged", () => {
    it("should start with a clean state", async () => {
        jest.mock('openai', () => {
            return MockOpenAI.withChoices();
        });

        const { useRagged } = await import("../react/useRagged");


        const { result } = renderHook(() => useRagged({
            provider: "openai",
            config: { apiKey: "test-api-key" }
        }));

        expect(result.current.getChatHistory()).toEqual([])
        expect(result.current.getLiveResponse()).toEqual(null);
    })
})