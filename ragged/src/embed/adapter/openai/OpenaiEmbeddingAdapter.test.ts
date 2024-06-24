import { startPollyRecording } from "../../../../test/startPollyRecording.js";
import { ApiClient } from "../../../support/ApiClient.js";
import { FetchRequestFailedError } from "../../../support/CustomErrors.js";
import { OpenaiEmbeddingAdapter } from "./OpenaiEmbeddingAdapter.js";

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