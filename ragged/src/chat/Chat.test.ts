import { Chat } from ".";
import { Message } from "./index.types";
import { BaseChatAdapter } from "./provider/index.types";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";

describe("Chat", () => {
    let adapter: DeepMockProxy<BaseChatAdapter>;
    let c: Chat;

    beforeEach(() => {
        adapter = mockDeep<BaseChatAdapter>();
        c = new Chat(adapter);
    });

    describe("Default behaviour", () => {
        it("Calls the adapter with the correct request", async () => {
            adapter.chat.mockResolvedValue({ history: [] });

            await c.chat(`This is a test message to the adapter`);

            expect(adapter.chat).toHaveBeenCalledWith({
                history: [
                    {
                        type: "user",
                        text: "This is a test message to the adapter"
                    }
                ]
            });
        });

        it("returns just the responses", async () => {
            const expectedOutput: Message[] = [
                {
                    type: "bot",
                    text: "This is a test response from the adapter"
                }
            ];

            adapter.chat.mockResolvedValue({ history: expectedOutput });

            const history = await c.chat(`This is a test message to the adapter`, [{
                type: "system",
                text: "This is a system message"
            }]);

            expect(history).toMatchObject([
                ...expectedOutput
            ] as Message[]);
        });

        it("can chat even without a history of messages", async () => {
            const expectedOutput: Message[] = [
                {
                    type: "bot",
                    text: "This is a test response from the adapter"
                }
            ];

            adapter.chat.mockResolvedValue({ history: expectedOutput });

            const history = await c.chat(`This is a test message to the adapter`);

            expect(history).toMatchObject([
                ...expectedOutput
            ] as Message[]);
        });
    });

    describe("with recording", () => {
        it("should return the history of messages", async () => {
            c.record(true);

            // adapter should return just the LLM response
            adapter.chat.mockResolvedValue({
                history: [
                    {
                        type: "bot",
                        text: "This is a test response from the adapter"
                    }
                ]
            });

            const messages = await c.chat(`This is a test message to the adapter`);

            expect(messages).toMatchObject([
                {
                    type: "user",
                    text: `This is a test message to the adapter`
                },
                {
                    type: "bot",
                    text: "This is a test response from the adapter"
                }
            ] as Message[]);
        });

        it("should ignore the history passed in", async () => {
            c.record(true);

            // adapter should return just the LLM response
            adapter.chat.mockResolvedValue({
                history: [
                    {
                        type: "bot",
                        text: "This is a test response from the adapter"
                    }
                ]
            });

            const messages = await c.chat(`This is a test message to the adapter`, [
                {
                    type: "user",
                    text: "This message will be totally ignored"
                }
            ]);

            expect(messages).toMatchObject([
                {
                    type: "user",
                    text: `This is a test message to the adapter`
                },
                {
                    type: "bot",
                    text: "This is a test response from the adapter"
                }
            ] as Message[]);
        });
    })
})