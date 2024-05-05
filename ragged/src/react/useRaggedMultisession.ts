import { Ragged } from "../Ragged";
import { RaggedHistoryItem } from "../driver/types";
import { useEffect, useRef, useState } from "react";

type SessionTracker = {
    subject: ReturnType<Ragged["chat"]>;
    history: RaggedHistoryItem[];
    latestJoined: string;
    status: "streaming" | "idle.fresh" | "idle.error" | "idle.complete";
}

type SessionTrackerMap = Record<symbol, SessionTracker>;

type Props = {
    openaiApiKey: string;
}

export const useRaggedMultisession = (props: Props) => {
    const ragged = useRef<Ragged | null>(null);
    const [sessions, setSessions] = useState<SessionTrackerMap>({});

    useEffect(() => {
        ragged.current = new Ragged({
            provider: "openai",
            config: {
                apiKey: props.openaiApiKey,
                dangerouslyAllowBrowser: true
            }
        });
    }, [props.openaiApiKey]);

    return {
        sessions,

        getChatHistory(sessionId: symbol) {
            const session = sessions[sessionId];
            return session.history;
        },
        getLiveResponse(sessionId: symbol): string | null {
            const session = sessions[sessionId];
            if (session.status === "streaming") {
                return session.latestJoined;
            } else {
                return null;
            }
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
                        ...sessions[sessionId],
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
                        const stream = sessions[sessionId];

                        // clone the stream object
                        const returnObj: SessionTrackerMap = {
                            ...sessions,
                            [sessionId]: {
                                ...stream,
                                history: [...stream.history],
                                status: "streaming"
                            }
                        }

                        // if the value is a history item, push it to the history array
                        if (value.type === "history.text" || value.type === "history.tool.request" || value.type === "history.tool.result") {
                            returnObj[sessionId].history.push(value);
                        }

                        // if the value is a chunk of text, set it to the latestJoined string
                        if (value.type === "text.joined") {
                            returnObj[sessionId].latestJoined = value.data;
                        }

                        return returnObj;
                    });
                },
                complete: () => {
                    setSessions((sessions) => ({
                        ...sessions,
                        [sessionId]: {
                            ...sessions[sessionId],
                            status: "idle.complete"
                        }
                    }));
                },
                error: (error) => {
                    console.error(error);
                    setSessions((sessions) => ({
                        ...sessions,
                        [sessionId]: {
                            ...sessions[sessionId],
                            status: "idle.error"
                        }
                    }));
                }

            })

            return sessionId;
        }
    };
}