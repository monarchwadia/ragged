export type OllamaChatItem = {
  role: "user" | "system" | "assistant";
  content: string;
  images?: string[];
}

export interface OllamaChatRequestRoot {
  model: string;
  messages: OllamaChatItem[];
  stream?: boolean;
  format?: string;
  options?: Record<string, any>;
  keep_alive?: string;
}
