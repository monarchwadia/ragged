export type CohereChatMessage = {
    role: 'USER' | 'CHATBOT';
    message: string;
}

export type CohereConnector = {
    id: string;
}

export type CohereChatRequestRoot = {
    chat_history: CohereChatMessage[];
    message: string;
    connectors: CohereConnector[];
}