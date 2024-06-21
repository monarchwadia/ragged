import { startPollyRecording } from "../../../../test/startPollyRecording";
import { ApiClient } from "../../../support/ApiClient";
import { FetchRequestFailedError, ParameterValidationError } from "../../../support/CustomErrors";
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

    describe("cosineSimilarity", () => {
        it("works when the arrays are similar", () => {
            const result = adapter.cosineSimilarity(
                {
                    model: "dummy",
                    provider: "dummy",
                    embedding: [0, 1]
                },
                {
                    model: "dummy",
                    provider: "dummy",
                    embedding: [0, 1]
                }
            );

            expect(result).toBeCloseTo(1);
        });

        it("works when the arrays are dissimilar", () => {
            const result = adapter.cosineSimilarity(
                {
                    model: "dummy",
                    provider: "dummy",
                    embedding: [1, 0]
                },
                {
                    model: "dummy",
                    provider: "dummy",
                    embedding: [0, 1]
                }
            );

            expect(result).toBeCloseTo(0);
        });

        it("works when the arrays are at 60 degrees", () => {
            const result = adapter.cosineSimilarity(
                {
                    model: "dummy",
                    provider: "dummy",
                    embedding: [1, 1, 0]
                },
                {
                    model: "dummy",
                    provider: "dummy",
                    embedding: [1, 0, 1]
                }
            );

            expect(result).toBeCloseTo(0.5);
        });

        it("throws when embeddings are of different lengths", async () => {
            expect(() => {
                adapter.cosineSimilarity(
                    {
                        model: "dummy",
                        provider: "dummy",
                        embedding: [1, 2, 3]
                    },
                    {
                        model: "dummy",
                        provider: "dummy",
                        embedding: [1, 2, 3, 4]
                    }
                );
            }).toThrow(ParameterValidationError)
        });

        it.each([
            ["with different models", "dummy", "dummy", "smarty", "dummy"],
            ["with different models", "dummy", "dummy", "dummy", "smarty"],
            ["with different models and providers", "dummy", "dummy", "smarty", "smarty"],
        ])("throws a warning when embeddings are from different models", async (label, model1, provider1, model2, provider2) => {
            const loggerWarnSpy = jest.spyOn(OpenaiEmbeddingAdapter['logger'], "warn");
            adapter.cosineSimilarity(
                {
                    model: model1,
                    provider: provider1,
                    embedding: [1, 2, 3]
                },
                {
                    model: model2,
                    provider: provider2,
                    embedding: [1, 2, 3]
                }
            );

            expect(loggerWarnSpy).toHaveBeenCalled();
        });
    });
});