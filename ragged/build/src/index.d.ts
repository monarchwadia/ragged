import type { ClientOptions } from "openai";
type RaggedConfiguration = {
    openai: ClientOptions;
};
export declare class Ragged {
    private config;
    constructor(config: RaggedConfiguration);
    predict(text: string): import("rxjs").Subject<{
        type: "collected" | "finished";
        payload: string;
    } | {
        type: "started";
    }>;
    qPredict(text: string): Promise<string>;
}
export {};
