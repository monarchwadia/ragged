// REQUEST

export type AzureOpenAiChatCompletionRequestBody = {
    messages: AzureOpenAiChatRequestMessage[];
}

type AzureOpenAiChatRequestMessage = {
    role: "system";
    content: string;
} | {
    role: "user";
    content: string;
} | {
    role: "assistant";
    content: string;
};

// RESPONSE
export type AzureOpenAiChatCompletionResponseBody = {
    id: string;
    object: string;
    created: number;
    model: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    choices: Choice[];
};

type Choice = {
    message: {
        role: string;
        content: string;
    };
    finish_reason: string;
    index: number;
};



