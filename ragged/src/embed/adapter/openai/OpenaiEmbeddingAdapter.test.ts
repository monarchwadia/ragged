import { startPollyRecording } from "../../../../test/startPollyRecording";
import { ApiClient } from "../../../support/ApiClient";
import { FetchRequestFailedError } from "../../../support/CustomErrors";
import { OpenaiEmbeddingAdapter } from "./OpenaiEmbeddingAdapter";

describe("OpenaiEmbedAdapter", () => {
    describe("embed", () => {
        let adapter: OpenaiEmbeddingAdapter;

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

        it('throws when called without an apikey', async () => {
            const polly = startPollyRecording("OpenaiEmbeddingAdapter > embed > throws when called without an apikey");
            expect(() => adapter.embed({ text: "dummy" } as any)).rejects.toThrow(FetchRequestFailedError);;
            polly.stop();
        });
    })
});