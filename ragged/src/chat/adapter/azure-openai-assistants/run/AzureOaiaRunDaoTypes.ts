export interface OaiaRun {
    assistant_id: string;
    cancelled_at: Date | null;
    completed_at: Date | null;
    created_at: number;
    expires_at: number;
    failed_at: Date | null;
    id: string;
    incomplete_details: string | null;
    instructions: string;
    last_error: string | null;
    max_completion_tokens: number | null;
    max_prompt_tokens: number | null;
    metadata: Record<string, any>;
    model: string;
    object: string;
    parallel_tool_calls: boolean;
    required_action: string | null;
    response_format: string;
    started_at: Date | null;
    status: string;
    temperature: number;
    thread_id: string;
    tool_choice: string;
    tool_resources: Record<string, any>;
    tools: string[];
    top_p: number;
    truncation_strategy: TruncationStrategy;
    usage: Usage | null;
}

interface TruncationStrategy {
    last_messages: string[] | null;
    type: string;
}

interface Usage {
    // Define usage properties if known, else leave it generic
    [key: string]: any;
}
