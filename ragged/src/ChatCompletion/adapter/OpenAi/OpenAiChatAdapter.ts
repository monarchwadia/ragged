import { BaseChatAdapter, ChatRequest } from "../BaseChatAdapter.types";
import { OpenAiChatDriver } from "../../../ChatCompletion/driver/OpenAi/OpenAiChatDriver";
import { mapFromOpenAi, mapToOpenAi } from "./mappers";

export class OpenAiChatAdapter implements BaseChatAdapter {
    constructor(private driver: OpenAiChatDriver) { }
    async chat(request: ChatRequest) {
        const mappedRequest = mapToOpenAi(request);
        const response = await this.driver.chatCompletion(mappedRequest);
        const mappedResponse = mapFromOpenAi(response);
        return mappedResponse;
    }
}