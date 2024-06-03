

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
    | {
        type: "tool.request";
        toolRequestId: string;
        toolId: string;
        props: any;
    }
    | {
        type: "tool.response";
        toolRequestId: string;
        data: string;
    };

export type MessageType = Message["type"];