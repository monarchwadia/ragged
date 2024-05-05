import { RaggedHistoryItem } from "../driver/types";
import { useRef } from "react";
import { useRaggedMultisession } from "./useRaggedMultisession";
import { RaggedConfiguration } from "../types";
import { AbstractRaggedDriver } from "../driver/AbstractRaggedDriver";

type ReturnObj = {
    chat: (input: string | RaggedHistoryItem[]) => void;
    getChatHistory(): RaggedHistoryItem[];
    getLiveResponse(): string | null;
};

export function useRagged(props: RaggedConfiguration): ReturnObj;
export function useRagged(props: AbstractRaggedDriver): ReturnObj;
export function useRagged(props: any) {
    const sessionId = useRef<symbol | undefined>(undefined);
    const r = useRaggedMultisession(props);

    return {
        chat: (input: string | RaggedHistoryItem[]) => {
            if (sessionId.current) {
                r.chat(input, sessionId.current)
            } else {
                sessionId.current = r.chat(input);
            }
        },
        getChatHistory() {
            if (!sessionId.current) {
                return [];
            } else {
                return r.getChatHistory(sessionId.current);
            }
        },
        getLiveResponse() {
            if (!sessionId.current) {
                return null;
            } else {
                return r.getLiveResponse(sessionId.current);
            }
        }
    }
}