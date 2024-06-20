export type OaiaAssistantCreateRequestBody = {
    name: string;
    instructions: string;
    tools: { type: string; }[];
    model: string;
    description?: string | null
}

export type OaiaAssistantCreateResponse = {
    created_at: number;
    description: string | null;
    id: string;
    instructions: string;
    metadata: Record<string, unknown>;
    model: string;
    name: string;
    object: string;
    response_format: string;
    temperature: number;
    tool_resources: {
        file_search: {
            vector_store_ids: string[];
        };
    };
    tools: {
        type: string;
    }[];
};