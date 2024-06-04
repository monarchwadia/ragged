export type UserMessage = {
    type: "user";
    text: string | null;
};

export type BotMessage = {
    type: "bot";
    text: string | null;
};

export type SystemMessage = {
    type: "system";
    text: string;
};

export type ErrorMessage = {
    type: "error";
    text: string;
};

export type ToolRequestMessage = {
    type: "tool.request";
    toolRequestId: string;
    toolId: string;
    props: any;
};

export type ToolResponseMessage = {
    type: "tool.response";
    toolRequestId: string;
    data: string;
};

export type Message = UserMessage | BotMessage | SystemMessage | ErrorMessage | ToolRequestMessage | ToolResponseMessage;

export type MessageType = Message["type"];