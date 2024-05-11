import { RaggedHistoryItem } from "../driver/types";
import { useRef, useState } from "react";
import { SessionTrackerStatus, UniqueSessionId, useRaggedMultisession } from "./useRaggedMultisession";
import { RaggedConfiguration } from "../types";
import { AbstractRaggedDriver } from "../driver/AbstractRaggedDriver";
import { ChatOptions } from "../Ragged";
import { RaggedObservable } from "../RaggedObservable";

type ReturnObj = {
    chat: (input: string | RaggedHistoryItem | RaggedHistoryItem[], options?: ChatOptions | undefined) => RaggedObservable;
    getChatHistory(): RaggedHistoryItem[];
    abort(): void;
    getLiveResponse(): string | null;
    getStatus(): SessionTrackerStatus;
};

export function useRagged(props: RaggedConfiguration): ReturnObj;
export function useRagged(props: AbstractRaggedDriver): ReturnObj;
export function useRagged(props: any): ReturnObj {
    const [sessionId, setSessionId] = useState<UniqueSessionId | undefined>(undefined);
    // const sessionId = useRef<UniqueSessionId | undefined>(undefined);
    const r = useRaggedMultisession(props);

    return {
        getStatus: () => {
            if (sessionId) {
                return r.getStatus(sessionId);
            } else {
                return "idle.fresh";
            }
        },
        abort: () => {
            if (sessionId) {
                r.abort(sessionId);
            }
        },
        chat: (input: string | RaggedHistoryItem | RaggedHistoryItem[], options?: ChatOptions | undefined): RaggedObservable => {
            const { sessionId: receivedSessionId, subject } = r.chat(sessionId, input, options)
            setSessionId(receivedSessionId);
            return subject;
        },
        getChatHistory() {
            if (sessionId) {
                const history = r.getChatHistory(sessionId);
                return history;
            } else {
                return [];
            }
        },
        getLiveResponse() {
            if (sessionId) {
                const response = r.getLiveResponse(sessionId);
                return response;
            } else {
                return null;
            }
        }
    }
}