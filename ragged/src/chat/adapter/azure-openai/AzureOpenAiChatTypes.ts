// REQUEST

export type AzureOpenAiChatCompletionRequestBody = {
    messages: AzureOpenAiChatRequestMessage[];
}

// request message types

export type AzureOpenAiChatRequestMessageUser = {
    role: "user";
    content: (AzureOpenAiChatRequestMessageUserContentPartImage | AzureOpenAiChatRequestMessageUserContentPartText)[]
}

type AzureOpenAiChatRequestMessageUserContentPartImage = {
    type: "image_url";
    image_url: {
        url: string;
    };
    detail: "auto" | "low" | "high";
}

type AzureOpenAiChatRequestMessageUserContentPartText = {
    type: "text";
    text: string;
}

type AzureOpenAiChatRequestMessage = {
    role: "system";
    content: string;
} | {
    role: "assistant";
    content: string;
} | AzureOpenAiChatRequestMessageUser;


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



