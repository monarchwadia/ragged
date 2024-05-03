import { MockOpenAI } from "./MockOpenAi";

describe("MockOpenAI", () => {
    it("withChoices() works as advertised", async () => {
        const RESPONSES = [{ message: { content: "Hello, I am an AI" } }];

        jest.mock('openai', () => {
            return {
                OpenAI: MockOpenAI.withChoices([...RESPONSES])
            }
        });

        // Instantiate a new OpenAI instance
        const { OpenAI } = (await import("openai"));
        const o = new OpenAI({ apiKey: "" });

        // Start a stream
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

        // Collect all responses
        let result = [];
        for await (const event of stream) {
            result.push(event);
        }

        // assert
        expect(result).toEqual(RESPONSES);
    })
})