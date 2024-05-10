import { RaggedHistoryItem } from "../driver/types";
import { useRef } from "react";
import { UniqueSessionId, useRaggedMultisession } from "./useRaggedMultisession";
import { RaggedConfiguration } from "../types";
import { AbstractRaggedDriver } from "../driver/AbstractRaggedDriver";
import { ChatOptions } from "../Ragged";
import { RaggedObservable } from "../RaggedObservable";

type ReturnObj = {
    chat: (input: string | RaggedHistoryItem | RaggedHistoryItem[], options?: ChatOptions | undefined) => RaggedObservable;
    getChatHistory(): RaggedHistoryItem[];
    getLiveResponse(): string | null;
};

let prevSymbol: any = null;

export function useRagged(props: RaggedConfiguration): ReturnObj;
export function useRagged(props: AbstractRaggedDriver): ReturnObj;
export function useRagged(props: any): ReturnObj {
    const sessionId = useRef<UniqueSessionId | undefined>(undefined);
    const r = useRaggedMultisession(props);

    return {
        chat: (input: string | RaggedHistoryItem | RaggedHistoryItem[], options?: ChatOptions | undefined): RaggedObservable => {
            const { sessionId: receivedSessionId, subject } = r.chat(sessionId.current, input, options)
            sessionId.current = receivedSessionId;
            return subject;
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