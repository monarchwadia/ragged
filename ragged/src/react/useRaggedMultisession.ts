import { Ragged } from "../Ragged";
import { RaggedHistoryItem } from "../driver/types";
import { useEffect, useRef, useState } from "react";
import { RaggedConfiguration } from "../types";
import { AbstractRaggedDriver } from "../driver/AbstractRaggedDriver";
import { deepClone } from "./utils";

export type UniqueSessionId = number;
let nextUniqueSessionId = 1;
const generateUniqueSessionId = (): UniqueSessionId => {
    let newId = nextUniqueSessionId;
    nextUniqueSessionId++;
    return newId;
};

// internal state types 
type SessionTrackerMap = Record<UniqueSessionId, SessionTracker | undefined>;
type SessionTracker = {
    history: RaggedHistoryItem[];
    latestJoined: string;
    status: "streaming" | "idle.fresh" | "idle.error" | "idle.complete";
}

// return object type
type ReturnObj = {
    sessions: SessionTrackerMap;
    getChatHistory(sessionId: UniqueSessionId): RaggedHistoryItem[];
    getLiveResponse(sessionId: UniqueSessionId): string | null;
    chat: (input: string | RaggedHistoryItem[], sessionId?: UniqueSessionId) => UniqueSessionId | undefined;
}

export function useRaggedMultisession(props: RaggedConfiguration): ReturnObj;
export function useRaggedMultisession(props: AbstractRaggedDriver): ReturnObj;
export function useRaggedMultisession(props: any): ReturnObj {
    const ragged = useRef<Ragged | null>(null);
    const [sessions, setSessions] = useState<SessionTrackerMap>({});

    useEffect(() => {
        ragged.current = new Ragged(props);
    }, [props.openaiApiKey]);

    return {
        sessions,

        getChatHistory(sessionId: UniqueSessionId): RaggedHistoryItem[] {
            return getOrCreateSessionTracker(sessions, sessionId).history;
        },
        getLiveResponse(sessionId: UniqueSessionId): string | null {
            const session = getOrCreateSessionTracker(sessions, sessionId);

            if (session?.status === "streaming") {
                return session.latestJoined;
            }

            return null;
        },
        chat: (input: string | RaggedHistoryItem[], sessionId: number | undefined): UniqueSessionId | undefined => {
            // If Ragged hasn't been initialized yet, return an error
            if (!ragged.current) {
                console.error("Can't chat yet. Ragged not yet initialized.");
                return;
            }

            if (!sessionId) {
                sessionId = generateUniqueSessionId();
            }


            // Ensure that a session with this ID exists.
            const existingSession: SessionTracker = getOrCreateSessionTracker(sessions, sessionId);

            if (typeof input === "string") {
                existingSession.history.push({
                    type: "history.text",
                    role: "human",
                    data: {
                        text: input
                    }
                })
            } else {
                // it's a history item
                existingSession.history.push(...input);
            }

            const s$ = ragged.current?.chat(existingSession.history);

            setSessions((sessions) => {
                // create and set the session
                const returnObj = deepClone(sessions);
                let thisSession = getOrCreateSessionTracker(returnObj, sessionId);
                thisSession.status = "streaming";

                return returnObj;
            });

            s$.subscribe({
                next: (value) => {
                    setSessions((sessions) => {
                        const returnObj = deepClone(sessions);
                        let thisSession = getOrCreateSessionTracker(returnObj, sessionId);
                        thisSession.status = "streaming";

                        // if the value is a history item, push it to the history array
                        if (value.type === "history.text" || value.type === "history.tool.request" || value.type === "history.tool.result") {
                            thisSession.history.push(value);
                        }

                        // if the value is a chunk of text, set it to the latestJoined string
                        if (value.type === "text.joined") {
                            thisSession.latestJoined = value.data;
                        }

                        return returnObj;
                    });
                },
                complete: () => {
                    setSessions((sessions) => {
                        const returnObj = deepClone(sessions);
                        let thisSession = getOrCreateSessionTracker(returnObj, sessionId);
                        thisSession.status = "idle.complete";
                        return returnObj;
                    });
                },
                error: (error) => {
                    setSessions((sessions) => {
                        // TODO: Set the error message in the session
                        console.error("Error in session", sessionId, error)
                        const returnObj = deepClone(sessions);
                        let thisSession = getOrCreateSessionTracker(returnObj, sessionId);
                        thisSession.status = "idle.error";
                        return returnObj;
                    });
                }

            })

            return sessionId;
        }
    };
}

// Utilities
const getOrCreateSessionTracker = (map: SessionTrackerMap, sessionId: UniqueSessionId): SessionTracker => {
    let thisSession = map[sessionId];

    if (thisSession) {
        return thisSession;
    }

    thisSession = {
        history: [],
        latestJoined: "",
        status: "idle.fresh"
    }

    map[sessionId] = thisSession;

    return thisSession;
}