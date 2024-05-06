import { Ragged } from "../Ragged";
import { RaggedHistoryItem } from "../driver/types";
import { useEffect, useRef, useState } from "react";
import { RaggedConfiguration } from "../types";
import { AbstractRaggedDriver } from "../driver/AbstractRaggedDriver";
import { deepClone } from "./utils";
import { RaggedSubject } from "../RaggedSubject";

// internal state types 
type SessionTrackerMap = Record<symbol, SessionTracker | undefined>;
type SessionTracker = {
    subject?: ReturnType<Ragged["chat"]>;
    history: RaggedHistoryItem[];
    latestJoined: string;
    status: "streaming" | "idle.fresh" | "idle.error" | "idle.complete";
}

// return object type
type ReturnObj = {
    sessions: SessionTrackerMap;
    getChatHistory(sessionId: symbol): RaggedHistoryItem[];
    getLiveResponse(sessionId: symbol): string | null;
    chat: (input: string | RaggedHistoryItem[], sessionId?: symbol) => symbol | undefined;
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

        getChatHistory(sessionId: symbol): RaggedHistoryItem[] {
            return getOrCreateSessionTracker(sessions, sessionId).history;
        },
        getLiveResponse(sessionId: symbol): string | null {
            const session = sessions[sessionId];

            if (session?.status === "streaming") {
                return session.latestJoined;
            }

            return null;
        },
        chat: (input: string | RaggedHistoryItem[], sessionId: symbol = Symbol()): symbol | undefined => {

            if (!ragged.current) {
                console.error("Can't chat yet. Ragged not yet initialized.");
                return;
            }

            const existingSession: SessionTracker | undefined = sessions[sessionId];
            const history: RaggedHistoryItem[] = existingSession ? [...existingSession.history] : [];
            if (typeof input === "string") {
                history.push({
                    type: "history.text",
                    role: "human",
                    data: {
                        text: input
                    }
                })
            } else {
                history.push(...input);
            }

            const s$ = ragged.current?.chat(history);

            if (existingSession) {
                setSessions((sessions) => ({
                    ...sessions,
                    [sessionId]: {
                        ...existingSession,
                        history
                    }
                }));
            } else {
                setSessions((sessions) => ({
                    ...sessions,
                    [sessionId]: {
                        subject: s$,
                        history: history,
                        latestJoined: "",
                        status: "idle.fresh"
                    }
                }));
            }

            s$.subscribe({
                next: (value) => {
                    setSessions((sessions) => {
                        const returnObj = deepClone(sessions);
                        let thisSession = getOrCreateSessionTracker(returnObj, sessionId);
                        thisSession.subject = s$;
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
                        thisSession.subject = s$;
                        thisSession.status = "idle.complete";
                        return returnObj;
                    });
                },
                error: (error) => {
                    console.error(error);
                    const returnObj = deepClone(sessions);
                    let thisSession = getOrCreateSessionTracker(returnObj, sessionId);
                    thisSession.subject = s$;
                    thisSession.status = "idle.error";
                    return returnObj;
                }

            })

            return sessionId;
        }
    };
}

// Utilities

const getOrCreateSessionTracker = (map: SessionTrackerMap, sessionId: symbol): SessionTracker => {
    let thisSession = map[sessionId];

    if (thisSession) {
        return thisSession;
    }

    thisSession = {
        subject: undefined,
        history: [],
        latestJoined: "",
        status: "idle.fresh"
    }

    map[sessionId] = thisSession;

    return thisSession;
}