import { provideCohereChatAdapter } from ".";
import { startPollyRecording } from "../../../../test/startPollyRecording";
import { ChatRequest } from "../index.types";
import { CohereChatAdapter } from "./CohereChatAdapter";

describe("cohereChatAdapterProvider", () => {
    it("creates a CohereChatAdapter object", () => {
        const adapter = provideCohereChatAdapter();
        expect(adapter).toBeInstanceOf(CohereChatAdapter);
    });

    it("successfully performs a request", async () => {

        const adapter = provideCohereChatAdapter();

        const request: ChatRequest = {
            history: [
                {
                    type: "user",
                    text: "Hello, how are you?"
                }
            ]
        }

        const polly = startPollyRecording("cohereChatAdapterProvider > successfully performs a request");
        const response = await adapter.chat(request).then((response) => {
            expect(response).toBeDefined();
        });

        polly.stop();

        expect(response).toMatchInlineSnapshot();

    })
})