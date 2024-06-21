import { ParameterValidationError } from "../support/CustomErrors";
import { Embed } from "./Embed";
import { BaseEmbeddingAdapter, EmbeddingRequest, EmbeddingResponse } from "./Embed.types";

describe("Embed", () => {
    describe("with dummy adapter", () => {
        let dummyAdapter: BaseEmbeddingAdapter;
        let e: Embed;

        beforeEach(() => {
            dummyAdapter = {
                embed: async (request: EmbeddingRequest): Promise<EmbeddingResponse> => {
                    return {
                        provider: "dummy",
                        model: request.model || "default-dummy-model",
                        embedding: [0.1, 0.2, 0.3],
                    };
                }
            }
            e = new Embed(dummyAdapter);
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
        ] as any[][])("throws an error if anything other than exactly 1 arguments are provided. trial with [%s %s %s %s]", async (args: string[]) => {
            await expect(
                // @ts-expect-error - Testing invalid usage
                () => e.embed(...args)
            ).rejects.toThrow(ParameterValidationError);
        });
    })
})