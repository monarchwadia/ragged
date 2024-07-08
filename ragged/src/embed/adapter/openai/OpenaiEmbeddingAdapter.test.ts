import { startPollyRecording } from "../../../test/startPollyRecording";
import { ApiClient } from "../../../support/ApiClient";
import { FetchRequestFailedError } from "../../../support/RaggedErrors";
import { OpenaiEmbeddingAdapter } from "./OpenaiEmbeddingAdapter";

describe("OpenaiEmbedAdapter", () => {
    let adapter: OpenaiEmbeddingAdapter;
    let apiClient: ApiClient;

    beforeEach(() => {
        apiClient = new ApiClient();
        adapter = new OpenaiEmbeddingAdapter({
            // apiKey: process.env.OPENAI_API_KEY || "",
            apiKey: "dummyapikey"
        });
    })

    describe("embed", () => {
        it("can instantiate", () => {
            expect(adapter).toBeDefined();
        })

        it('throws when called without a bad apikey', async () => {
            const polly = startPollyRecording("OpenaiEmbeddingAdapter > embed > throws when called with a bad apikey");
            expect(() => adapter.embed({ text: "dummy", context: { apiClient } })).rejects.toThrow(FetchRequestFailedError);;
            await polly.stop();
        });



        it("gets embeddings", async () => {
            const polly = startPollyRecording("OpenaiEmbeddingAdapter > embed > gets embeddings");
            const embeddings = await adapter.embed({ text: "Hello, world!", context: { apiClient } });
            await polly.stop();

            expect(embeddings).toBeDefined();
            expect(embeddings).toMatchSnapshot();
        });
    })
});