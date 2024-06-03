export type MessageType = "user" | "bot" | "system";

export type Message = {
    type: MessageType;
    text: string;
}
