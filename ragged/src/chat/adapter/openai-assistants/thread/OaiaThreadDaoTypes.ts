type ToolResources = {
    // Define the structure of tool_resources if it has known properties
};

type Metadata = {
    // Define the structure of metadata if it has known properties
};

export interface OaiaThread {
    created_at: number;
    id: string;
    metadata: Metadata;
    object: string;
    tool_resources: ToolResources;
}
