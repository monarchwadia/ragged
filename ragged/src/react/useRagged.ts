import { RaggedHistoryItem } from "../driver/types";
import { useRef } from "react";
import { UniqueSessionId, useRaggedMultisession } from "./useRaggedMultisession";
import { RaggedConfiguration } from "../types";
import { AbstractRaggedDriver } from "../driver/AbstractRaggedDriver";

type ReturnObj = {
    chat: (input: string | RaggedHistoryItem[]) => void;
    getChatHistory(): RaggedHistoryItem[];
    getLiveResponse(): string | null;
};

let prevSymbol: any = null;

export function useRagged(props: RaggedConfiguration): ReturnObj;
export function useRagged(props: AbstractRaggedDriver): ReturnObj;
export function useRagged(props: any) {
    const sessionId = useRef<UniqueSessionId | undefined>(undefined);
    const r = useRaggedMultisession(props);

    return {
        chat: (input: string | RaggedHistoryItem[]) => {
            if (sessionId.current) {
                r.chat(sessionId.current, input)
            } else {
                sessionId.current = r.chat(undefined, input);
            }
        },
        getChatHistory() {
            if (sessionId.current) {
                prevSymbol = sessionId.current;
                const history = r.getChatHistory(sessionId.current);
                return history;
            } else {
                return [];
            }
        },
        getLiveResponse() {
            if (sessionId.current) {
                const response = r.getLiveResponse(sessionId.current);
                return response;
            } else {
                return null;
            }
        }
    }
}