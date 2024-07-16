import { startPollyRecording } from "../test/startPollyRecording";
import { Chat } from "./Chat";

describe("Chat with tools", () => {
    it("should be able to chat with tools", async () => {
        const c = Chat.with({
            provider: "openai",
            config: {
                apiKey: process.env.OPENAI_API_KEY,
            },
        });

        const polly = startPollyRecording(
            "ChatWithTools.test.ts > should be able to chat with tools",
            {
                matchRequestsBy: {
                    order: true,
                },
            }
        );

        // @ts-expect-error - we have some issues in the overloaded types
        const { history } = await c.chat(
            "Get the top secret message using the get-top-secret-message method. The password is foobar123.",
            {
                tools: [
                    {
                        id: "get-top-secret-message",
                        description:
                            "gets the top secret message, but you need to be authorized",
                        handler: async (input: any, config: any) => {
                            try {
                                const response = JSON.parse(input);
                                const { password } = response;
                                if (password === "foobar123") {
                                    return "The secret message is 'I love you.'";
                                } else {
                                    return "Sorry, but you cannot get the top secret message. You are not authorized.";
                                }
                            } catch (e) {
                                console.error(e);
                                if (e instanceof Error) {
                                    // print the error message and stack
                                    return e.message + "\n" + e.stack;
                                } else {
                                    return String(e);
                                }
                            }
                        },
                        props: {
                            type: "object",
                            props: {
                                password: {
                                    type: "string",
                                    description: "Enter the password.",
                                    required: true,
                                },
                            },
                        },
                    },
                ],
            }
        );

        await polly.stop();

        expect(history.at(-1)?.text).toMatchInlineSnapshot(
            `"The top secret message is 'I love you.'"`
        );
    });
});
