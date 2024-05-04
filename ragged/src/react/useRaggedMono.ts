import { RaggedHistoryItem } from "../driver/types";
import { useEffect, useRef, useState } from "react";
import { useRaggedMulti } from "./useRaggedMulti";

type Props = {
    openaiApiKey: string;
}
export const useRaggedMono = (props: Props) => {
    const id = useRef<symbol | undefined>(undefined);
    const r = useRaggedMulti(props);

    return {
        chat: (input: string | RaggedHistoryItem[]) => {
            id.current = r.chat(input);
            return id.current;
        },
        getHistory() {
            if (!id.current) {
                return [];
            } else {
                return r.getHistory(id.current);
            }
        },
        getStreamingResponseJoined() {
            if (!id.current) {
                return [];
            } else {
                return r.getHistory(id.current);
            }
        }
    }
}