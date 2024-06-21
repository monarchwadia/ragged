import { ParameterValidationError } from "../support/CustomErrors";
import { BaseEmbeddingAdapter, EmbeddingRequest, EmbeddingResponse } from "./Embed.types";

export class Embed {
    constructor(private adapter: BaseEmbeddingAdapter) { }

    async embed(text: string): Promise<EmbeddingResponse>;
    async embed(request: EmbeddingRequest): Promise<EmbeddingResponse>;
    async embed(...args: any[]): Promise<EmbeddingResponse> {
        const request = this.validatedRequest(args);
        return this.adapter.embed(request);
    }

    private validatedRequest(args: any[]): EmbeddingRequest {
        if (args.length !== 1) {
            throw new ParameterValidationError("Embed function requires exactly one argument. Instead, got " + args.length + " arguments.");
        }

        let request: EmbeddingRequest;
        if (typeof args[0] === "string") {
            request = { text: args[0] };
        } else {
            request = args[0];
        }

        return request;
    }
}