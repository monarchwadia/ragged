export interface OaiaMessage {
    assistant_id: string | null;
    attachments: any[];
    content: Content[];
    created_at: number;
    id: string;
    metadata: Record<string, any>;
    object: string;
    role: string;
    run_id: string | null;
    thread_id: string;
}

interface Content {
    text: TextContent;
    type: string;
}

interface TextContent {
    annotations: any[];
    value: string;
}

export interface OaiaMessageList {
    object: string;
    data: OaiaMessage[];
    first_id: string;
    last_id: string;
    has_more: boolean;
}