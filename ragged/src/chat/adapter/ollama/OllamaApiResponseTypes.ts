export interface ChatItem {
  role: "user" | "system" | "assistant";
  content: string;
  images?: string[] | null;
}

export interface MetaData {
  model: string;
  created_at: string;
}

export interface Statistics {
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
}

export interface OllamaChatResponseRoot {
  message: ChatItem;
  done: boolean;
  meta: MetaData;
  statistics?: Statistics;
}
