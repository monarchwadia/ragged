export interface ChatItem {
  role: "CHATBOT" | "SYSTEM" | "USER";
  message: string;
}

export interface MetaData {
  version: string;
}

export interface BilledUnits {
  input_tokens: number;
  output_tokens: number;
}

export interface Tokens {
  input_tokens: number;
  output_tokens: number;
}

export interface Meta {
  api_version: MetaData;
  billed_units: BilledUnits;
  tokens: Tokens;
}

export interface CohereChatResponseRoot {
  chat_history: ChatItem[];
  response_id: string;
  text: string;
  generation_id: string;
  finish_reason: string;
  meta: Meta;
}