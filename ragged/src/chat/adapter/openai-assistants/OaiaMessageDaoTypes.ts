export interface CreateMessageResponseBody {
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
