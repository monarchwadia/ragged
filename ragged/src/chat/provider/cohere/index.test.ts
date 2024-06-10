import { provideCohereChatAdapter } from ".";
import { CohereChatAdapter } from "./CohereChatAdapter";

describe("cohereChatAdapterProvider", () => {
    it("creates a CohereChatAdapter object", () => {
        const adapter = provideCohereChatAdapter();
        expect(adapter).toBeInstanceOf(CohereChatAdapter);
    });

    // it("successfully performs a request", () => {
    //     const adapter = provideCohereChatAdapter();
    //     const request = {
    //         message: "Hello, world!"
    //     };
    //     adapter.chat(request).then((response) => {
    //         expect(response).toBeDefined();
    //     });
    // })
})