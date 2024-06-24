import { startPollyRecording } from "../../../../test/startPollyRecording";
import { ApiClient } from "../../../support/ApiClient";
import { FetchRequestFailedError } from "../../../support/RaggedErrors";
import { OpenaiEmbeddingAdapter } from "./OpenaiEmbeddingAdapter";

describe("OpenaiEmbedAdapter", () => {
    let adapter: OpenaiEmbeddingAdapter;

    beforeEach(() => {
        adapter = new OpenaiEmbeddingAdapter({
            // apiKey: process.env.OPENAI_API_KEY || "",
            apiKey: "dummyapikey",
            apiClient: new ApiClient()
        });
    })

    describe("embed", () => {



        beforeEach(() => {
            const apiClient = new ApiClient();
            adapter = new OpenaiEmbeddingAdapter({
                apiKey: "dummyapikey",
                apiClient
            });
        })

        it("can instantiate", () => {
            expect(adapter).toBeDefined();
        })

        it('throws when called without a bad apikey', async () => {
            const polly = startPollyRecording("OpenaiEmbeddingAdapter > embed > throws when called with a bad apikey");
            expect(() => adapter.embed({ text: "dummy" } as any)).rejects.toThrow(FetchRequestFailedError);;
            polly.stop();
        });



        it("gets embeddings", async () => {
            const polly = startPollyRecording("OpenaiEmbeddingAdapter > embed > gets embeddings");
            const embeddings = await adapter.embed({ text: "Hello, world!" });
            polly.stop();

            expect(embeddings).toBeDefined();
            expect(embeddings).toMatchSnapshot();
        });
    })
});