import { MockOpenAI } from "./MockOpenAi";
import { Ragged } from "../../main";


describe("ragged.tool-use", () => {
    it("correctly handles tool use", async () => {
        jest.mock('openai', () => {
            return {
                OpenAI: MockOpenAI.withChoices([]) // TODO: add choices
            }
        });

        const r = new Ragged({
            provider: "openai",
            config: {
                apiKey: "fake-api-key"
            }
        })

        const { OpenAI } = (await import("openai"));

        const o = new OpenAI({ apiKey: "fake-api-key" });
        const stream = await o.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: "Hello, AI"
                }
            ],
            stream: true
        })

        for await (const event of stream) {
            console.log(event);
        }
    })
})