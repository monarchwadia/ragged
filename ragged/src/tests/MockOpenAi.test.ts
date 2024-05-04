import { MockOpenAI } from "./MockOpenAi";

/*
    Mocking OpenAI's SDK is not trivial. The SDK uses a streaming API to communicate with the OpenAI service. 
    This means that we need to mock the streaming API as well. 

    MockOpenAI is a class that we have built to help us mock the OpenAI SDK. It provides a `withChoices` method 
    that allows us to specify the responses that the SDK should return when it is called. It is designed to
    replace the OpenAI SDK in our tests. This way, we can control the responses that the SDK returns and test
    our code in a predictable way.

    This test is for the `withChoices` method. We are testing that the SDK returns the responses that we have specified.
*/
describe("MockOpenAI", () => {
    it("withChoices() works as advertised", async () => {
        // Set the responses that the SDK should return
        const RESPONSES = [{ message: { content: "Hello, I am an AI" } }];
        jest.mock('openai', () => {
            return {
                OpenAI: MockOpenAI.withChoices([...RESPONSES])
            }
        });

        // Instantiate a new OpenAI instance -- of course, it's actually a MockOpenAI instance
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

        // collect all responses
        let result: any[] = [];

        const reader = stream.toReadableStream().getReader(); // to read responses from the stream
        const decoder = new TextDecoder(); // to convert binary to JSON

        // define a recursive function to read all responses
        const recursivelyRead = async () => {
            const { done, value } = await reader.read();
            if (done) {
                return;
            }

            // The responses are binary, so we need to decode them
            const decoded = JSON.parse(decoder.decode(value));
            result.push(decoded);
            await recursivelyRead();
        }

        await recursivelyRead();

        expect(result).toEqual(RESPONSES);
    })
})