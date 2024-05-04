import { Ragged } from "../Ragged";
import { RaggedHistoryItem } from "../driver/types";
import { useEffect, useRef, useState } from "react";

type StreamTracker = {
    subject: ReturnType<Ragged["chat"]>;
    history: RaggedHistoryItem[];
    latestJoined: string;
    status: "streaming" | "idle.fresh" | "idle.error" | "idle.complete";
}

type StreamTrackerMap = Record<symbol, StreamTracker>;

type Props = {
    openaiApiKey: string;
}
export const useRagged = (props: Props) => {
    const ragged = useRef<Ragged | null>(null);
    const [streams, setStreams] = useState<StreamTrackerMap>({});

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
        streams,

        getHistory(id: symbol) {
            const stream = streams[id];
            return stream.history;
        },
        getStreamingResponseJoined(id: symbol): string | null {
            const stream = streams[id];
            if (stream.status === "streaming") {
                return stream.latestJoined;
            } else {
                return null;
            }
        },
        chat: (input: string | RaggedHistoryItem[], id: symbol = Symbol()): symbol | undefined => {
            if (!ragged.current) {
                console.error("Can't chat yet. Ragged not yet initialized.");
                return;
            }

            const existingStream: StreamTracker | undefined = streams[id];
            const history: RaggedHistoryItem[] = existingStream ? [...existingStream.history] : [];
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

            if (existingStream) {
                setStreams((streams) => ({
                    ...streams,
                    [id]: {
                        ...streams[id],
                        history
                    }
                }));
            } else {
                setStreams((streams) => ({
                    ...streams,
                    [id]: {
                        subject: s$,
                        history: history,
                        latestJoined: "",
                        status: "idle.fresh"
                    }
                }));
            }

            s$.subscribe({
                next: (value) => {
                    setStreams((streams) => {
                        const stream = streams[id];

                        // clone the stream object
                        const returnObj: StreamTrackerMap = {
                            ...streams,
                            [id]: {
                                ...stream,
                                history: [...stream.history],
                                status: "streaming"
                            }
                        }

                        // if the value is a history item, push it to the history array
                        if (value.type === "history.text" || value.type === "history.tool.request" || value.type === "history.tool.result") {
                            returnObj[id].history.push(value);
                        }

                        // if the value is a chunk of text, set it to the latestJoined string
                        if (value.type === "text.joined") {
                            returnObj[id].latestJoined = value.data;
                        }

                        return returnObj;
                    });
                },
                complete: () => {
                    setStreams((streams) => ({
                        ...streams,
                        [id]: {
                            ...streams[id],
                            status: "idle.complete"
                        }
                    }));
                },
                error: (error) => {
                    console.error(error);
                    setStreams((streams) => ({
                        ...streams,
                        [id]: {
                            ...streams[id],
                            status: "idle.error"
                        }
                    }));
                }

            })

            return id;
        }
    };
}