import { Hooks } from "../support/ApiClient";
import { DataUriEntity } from "../support/data-uri/DataUri.types";
import { Tool } from "../tools/Tools.types";

export type UserMessageAttachment =
    | {
        type: "image",
        payload: DataUriEntity
    }

export type UserMessage = {
    type: "user";
    text: string | null;
    attachments?: UserMessageAttachment[];
};

export type BotMessage = {
    type: "bot";
    text: string | null;
    toolCalls?: (ToolResponse | ToolRequest)[];
};

export type SystemMessage = {
    type: "system";
    text: string | null;
};

export type ErrorMessage = {
    type: "error";
    text: string;
};

export type ToolRequest = {
    type: "tool.request";
    toolName: string;
    props: any;
    meta: any;
};

export type ToolResponse = {
    type: "tool.response";
    toolName: string;
    data: string;
    meta: any;
};

export type Message = UserMessage | BotMessage | SystemMessage | ErrorMessage;

export type MessageType = Message["type"];

export type ChatConfig = {
    tools?: Tool[];
    model?: string;
    hooks?: Hooks
}