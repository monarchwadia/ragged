

export type Message =
    | {
        type: "user";
        text: string;
    }
    | {
        type: "bot";
        text: string;
    }
    | {
        type: "system";
        text: string;
    }
    | {
        type: "error";
        text: string;
    }

export type MessageType = Message["type"];