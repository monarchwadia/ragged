import { Ragged } from "../Ragged"
import { OpenAiRaggedDriver } from "../driver/openai/OpenAiRaggedDriver"

describe("Ragged constructor", () => {
    it("can build using fromConfig", () => {
        const r = new Ragged({
            provider: "openai",
            config: {
                apiKey: "test-api-key",
            }
        })

        expect(r).not.toBeFalsy()
    })

    it("can build using a driver", () => {
        const driver = new OpenAiRaggedDriver({
            apiKey: "test-api-key"
        })
        const r = new Ragged(driver);

        expect(r).not.toBeFalsy()
    })
})