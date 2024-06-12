
export type CohereChatItem = {
  role: "CHATBOT" | "SYSTEM" | "USER";
  message: string;
}

export interface CohereChatRequestRoot {
  chat_history?: CohereChatItem[];
  message: string | undefined;
}
