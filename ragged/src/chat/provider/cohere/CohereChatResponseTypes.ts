export type CohereCitation = {
    start: number;
    end: number;
    text: string;
    document_ids: string[];
};

export type CohereDocument = {
    id: string;
    additionalProp: string;
};

export type CohereSearchQuery = {
    text: string;
    generation_id: string;
};

export type CohereSearchResult = {
    search_query: {
        text: string;
        generation_id: string;
    };
    connector: {
        id: string;
    };
    document_ids: string[];
    error_message: string;
    continue_on_failure: boolean;
};

export type CohereToolCall = {
    name: string;
    parameters: {
        [key: string]: any;
    };
};

export type CohereChatHistory = {
    role: "CHATBOT";
    message: string;
    tool_calls?: CohereToolCall[];
    tool_results?: {
        call: CohereToolCall;
        outputs: {
            [key: string]: any;
        }[];
    }[];
};

export type CohereApiVersion = {
    version: string;
    is_deprecated: boolean;
    is_experimental: boolean;
};

export type CohereBilledUnits = {
    input_tokens: number;
    output_tokens: number;
    search_units: number;
    classifications: number;
};

export type CohereTokens = {
    input_tokens: number;
    output_tokens: number;
};

export type CohereMeta = {
    api_version: CohereApiVersion;
    billed_units: CohereBilledUnits;
    tokens: CohereTokens;
    warnings: string[];
};

export type CohereChatResponseRoot = {
    text: string;
    generation_id: string;
    citations: CohereCitation[];
    documents: CohereDocument[];
    is_search_required: boolean;
    search_queries: CohereSearchQuery[];
    search_results: CohereSearchResult[];
    finish_reason: "COMPLETE";
    tool_calls: CohereToolCall[];
    chat_history: CohereChatHistory[];
    meta: CohereMeta;
};
