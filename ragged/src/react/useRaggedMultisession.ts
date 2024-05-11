import { ChatOptions, Ragged } from "../Ragged";
import { RaggedHistoryItem } from "../driver/types";
import { useEffect, useRef, useState } from "react";
import { RaggedConfiguration } from "../types";
import { AbstractRaggedDriver } from "../driver/AbstractRaggedDriver";
import { deepClone } from "./utils";
import { RaggedObservable } from "../RaggedObservable";

export type UniqueSessionId = number;
let nextUniqueSessionId = 1;
const generateUniqueSessionId = (): UniqueSessionId => {
    let newId = nextUniqueSessionId;
    nextUniqueSessionId++;
    return newId;
};
export type SessionTrackerStatus = "streaming" | "aborting" | "idle.fresh" | "idle.error" | "idle.complete";

// internal state types 
type SessionTrackerMap = Record<UniqueSessionId, SessionTracker | undefined>;
type SessionTracker = {
    history: RaggedHistoryItem[];
    latestJoined: string;
    status: SessionTrackerStatus
}
type ObservableTrackerMap = Record<UniqueSessionId, RaggedObservable | undefined>;

// return object type
type ReturnObj = {
    sessions: SessionTrackerMap;
    getChatHistory(sessionId: UniqueSessionId): RaggedHistoryItem[];
    getLiveResponse(sessionId: UniqueSessionId): string | null;
    getStatus(sessionId: UniqueSessionId): SessionTrackerStatus;
    chat: (sessionId: UniqueSessionId | undefined, input: string | RaggedHistoryItem | RaggedHistoryItem[], options?: ChatOptions | undefined) => ChatReturnObject;
    abort: (sessionId: UniqueSessionId) => void;
}

// chat() response object
export type ChatReturnObject = {
    subject: RaggedObservable;
    sessionId: UniqueSessionId;
}

export function useRaggedMultisession(props: RaggedConfiguration): ReturnObj;
export function useRaggedMultisession(props: AbstractRaggedDriver): ReturnObj;
export function useRaggedMultisession(props: any): ReturnObj {
    const ragged = useRef<Ragged | null>(null);
    const [sessions, setSessions] = useState<SessionTrackerMap>({});
    const [observables, setObservables] = useState<ObservableTrackerMap>({});

    useEffect(() => {
        ragged.current = new Ragged(props);
    }, [props]);

    return {
        sessions,
        getStatus(sessionId) {
            return getOrCreateSessionTracker_IS_MUTABLE(sessions, sessionId).status;
        },
        getChatHistory(sessionId: UniqueSessionId): RaggedHistoryItem[] {
            return getOrCreateSessionTracker_IS_MUTABLE(sessions, sessionId).history;
        },
        getLiveResponse(sessionId: UniqueSessionId): string | null {
            const session = getOrCreateSessionTracker_IS_MUTABLE(sessions, sessionId);

            if (session?.status === "streaming") {
                return session.latestJoined;
            }

            return null;
        },
        abort(sessionId: UniqueSessionId): void {
            const session = getOrCreateSessionTracker_IS_MUTABLE(sessions, sessionId);
            const observable = observables[sessionId];
            if (observable) {
                console.log("session.observable.abortStream", observable?.abortStream)
                observable.abortStream();
                setSessions((sessions) => {
                    const returnObj = deepClone(sessions);
                    let thisSession = getOrCreateSessionTracker_IS_MUTABLE(returnObj, sessionId);
                    thisSession.status = "aborting";
                    return returnObj;
                });
            }
        },
        chat: (sessionId: number | undefined, input: string | RaggedHistoryItem | RaggedHistoryItem[], options?: ChatOptions | undefined): ChatReturnObject => {
            // If Ragged hasn't been initialized yet, return an error
            if (!ragged.current) {
                throw new Error("Can't chat yet. Ragged not yet initialized.");
            }

            if (!sessionId) {
                sessionId = generateUniqueSessionId();
            }


            // Ensure that a session with this ID exists.
            const existingSession: SessionTracker = getOrCreateSessionTracker_IS_MUTABLE(sessions, sessionId);

            if (typeof input === "string") {
                existingSession.history.push({
                    type: "history.text",
                    role: "human",
                    data: {
                        text: input
                    }
                })
            } else if (input instanceof Array) {
                existingSession.history = deepClone(input);
            } else {
                // it's a history item
                existingSession.history.push(deepClone(input));
            }

            const s$ = ragged.current?.chat(existingSession.history, options);
            observables[sessionId] = s$;
            setObservables({ ...observables });
            existingSession.status = "streaming";
            setSessions(deepClone(sessions));

            // setSessions((sessions) => {
            //     // create and set the session
            //     const returnObj = deepClone(sessions);
            //     let thisSession = getOrCreateSessionTracker(returnObj, sessionId);
            //     thisSession.status = "streaming";

            //     return returnObj;
            // });

            s$.subscribe({
                next: (value) => {
                    setSessions((sessions) => {
                        const returnObj = deepClone(sessions);
                        let thisSession = getOrCreateSessionTracker_IS_MUTABLE(returnObj, sessionId);
                        if (thisSession.status !== "aborting") {
                            thisSession.status = "streaming";
                        }

                        // if the value is a history item, push it to the history array
                        if (value.type === "history.text" || value.type === "history.tool.request" || value.type === "history.tool.result") {
                            console.log("Pushing to history", value)
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
                        let thisSession = getOrCreateSessionTracker_IS_MUTABLE(returnObj, sessionId);
                        thisSession.status = "idle.complete";
                        thisSession.latestJoined = "";
                        return returnObj;
                    });
                },
                error: (error) => {
                    setSessions((sessions) => {
                        // TODO: Set the error message in the session
                        console.error("Error in session", sessionId, error)
                        const returnObj = deepClone(sessions);
                        let thisSession = getOrCreateSessionTracker_IS_MUTABLE(returnObj, sessionId);
                        thisSession.status = "idle.error";
                        return returnObj;
                    });
                }

            })

            return {
                subject: s$,
                sessionId: sessionId
            };
        }
    };
}

/**
 * 
 * Creates a new session tracker if one does not exist for the given session ID.
 * The new session tracker is added to the map and is intended to be mutated by the code.
 * Note that the original map is mutated, and the returned object is also intended to be mutable.
 * After mutation, the client should call setSessions() and deepClone() to update the state.
 * 
 * @param map 
 * @param sessionId 
 * @returns 
 */
const getOrCreateSessionTracker_IS_MUTABLE = (map: SessionTrackerMap, sessionId: UniqueSessionId): SessionTracker => {
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