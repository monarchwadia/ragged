import { Chat } from "ragged/chat";
import { provideCohereChatAdapter } from "ragged/chat/adapter/cohere";
import { PoolWrapperAdapter } from "./resource-pooling";

describe("examples > nodejs > resource-pooling", () => {
    it("can build", () => {
        const c = new Chat(new PoolWrapperAdapter([
            provideCohereChatAdapter({
                config: {
                    apiKey: '123',
                    model: 'command-r'
                }
            })
        ]));

    })
})