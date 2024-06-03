import { Chat } from ".";
import { Message } from "./index.types";
import { BaseChatAdapter } from "./provider/index.types";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";

describe("Chat", () => {
    let adapter: DeepMockProxy<BaseChatAdapter>;
    let chat: Chat;

    beforeEach(() => {
        adapter = mockDeep<BaseChatAdapter>();
        chat = new Chat(adapter);
    });

    it("should be able to chat", async () => {
        const history: Message[] = [
            {
                type: "bot",
                text: "This is a test response from the adapter"
            }
        ];

        adapter.chat.mockResolvedValue({ history });

        const response = await chat.chat([
            {
                type: "user",
                text: "This is a test message to the adapter"
            }
        ]);

        expect(response).toBe(history);
    });
})