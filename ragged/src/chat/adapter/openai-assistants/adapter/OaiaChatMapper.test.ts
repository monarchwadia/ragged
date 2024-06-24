import { Message } from "../../../index.types.js";
import { OaiaChatMapper } from "./OaiaChatMapper.js";

describe("OaiaChatMapper", () => {
    describe("mapMessageToOaia", () => {
        it("can map messages", () => {
            const threadId = "test";
            const message: Message = {
                text: "Hello, world!",
                type: "user"
            };

            const mapped = OaiaChatMapper.mapMessageToOaia(threadId, message);

            expect(mapped).toEqual({
                threadId: threadId,
                body: {
                    content: message.text,
                    role: "user"
                }
            });
        });

        describe("Types that can be mapped", () => {
            it.each<[Message['type'], string]>([
                ["bot", "assistant"],
                ["user", "user"],
            ])("can map messages with type %s", (type, expectedRole) => {
                const threadId = "test";
                const message: Message = {
                    text: "Hello, world!",
                    type: type
                };

                const mapped = OaiaChatMapper.mapMessageToOaia(threadId, message);

                expect(mapped).toEqual({
                    threadId: threadId,
                    body: {
                        content: message.text,
                        role: expectedRole
                    }
                });
            });
        });

        describe("Types that cannot be mapped", () => {
            it.each<[Message['type']]>([
                ["system"],
                ["error"],
            ])("return null when tasked with messages of type %s", (type) => {
                const threadId = "test";

                const message: Message = {
                    text: "Hello, world!",
                    type
                };

                expect(OaiaChatMapper.mapMessageToOaia(threadId, message)).toBe(null);
            });
        });
    });

    describe("mapMessagesToOaia", () => {
        it("filters out messages that cannot be mapped", () => {
            const threadId = "test";
            const messages: Message[] = [
                {
                    text: "Hello, world!",
                    type: "user"
                },
                {
                    text: "Hello, world!",
                    type: "bot"
                },
                {
                    text: "Hello, world!",
                    type: "system"
                },
                {
                    text: "Hello, world!",
                    type: "error"
                }
            ];

            const mapped = OaiaChatMapper.mapMessagesToOaia(threadId, messages);

            expect(mapped).toEqual([
                {
                    threadId: threadId,
                    body: {
                        content: messages[0].text,
                        role: "user"
                    }
                },
                {
                    threadId: threadId,
                    body: {
                        content: messages[1].text,
                        role: "assistant"
                    }
                },
            ]);
        });
    });

    // describe("mapMessageFromOaia", () => {
    //     OaiaChatMapper.mapMessagesFromOaia()
    // })
});