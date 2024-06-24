import { ParameterValidationError } from "../support/CustomErrors.js";
import { Embed } from "./Embed.js";
import type { EmbeddingRequest, Embedding } from "./Embed.types.js";
import type { BaseEmbeddingAdapter } from "./adapter/index.types.js";

describe("Embed", () => {
    describe("with dummy adapter", () => {
        let dummyAdapter: BaseEmbeddingAdapter;
        let e: Embed;

        beforeEach(() => {
            dummyAdapter = {
                embed: async (request: EmbeddingRequest): Promise<Embedding> => {
                    return {
                        provider: "dummy",
                        model: request.model || "default-dummy-model",
                        embedding: [0.1, 0.2, 0.3],
                    };
                }
            }
            e = new Embed(dummyAdapter);
        });

        afterEach(() => {
            jest.clearAllMocks();
        })

        it("can instantiate", () => {
            expect(e).toBeDefined();
        });

        it("returns the expected embeddings", async () => {
            const response = await e.embed({ text: "dummy", model: "dummy-model" });
            expect(response).toEqual({
                provider: "dummy",
                model: "dummy-model",
                embedding: [0.1, 0.2, 0.3],
            });
        });

        it.each([
            [[]],
            [['firstparam', 'secondparam']],
            [['firstparam', 'secondparam', 'thirdparam']],
            [['firstparam', 'secondparam', 'thirdparam', 'fourthparam']]
        ] as any[][])("throws an error if anything other than exactly 1 arguments are provided. trial with [%s %s %s %s]", async (args: []) => {
            await expect(
                // @ts-expect-error - Testing invalid usage
                () => e.embed(...args)
            ).rejects.toThrow(ParameterValidationError);
        });


        describe("cosineSimilarity", () => {
            it("works when the arrays are similar", () => {
                const result = e.cosineSimilarity(
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
                const result = e.cosineSimilarity(
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
                const result = e.cosineSimilarity(
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
                    e.cosineSimilarity(
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
                const loggerWarnSpy = jest.spyOn(Embed['logger'], "warn");
                e.cosineSimilarity(
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
    })
})