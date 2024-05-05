/**
 * Mocking OpenAI's SDK is not trivial. The SDK uses a streaming API to communicate with the OpenAI service.
 * This means that we need to mock the streaming API as well, which is not straightforward.
 * MockOpenAI is a class that we have built to help us mock the OpenAI SDK. It provides a `withChoices` method
 * that allows us to specify the responses that the SDK should return when it is called. It is designed to
 * replace the OpenAI SDK in our tests. This way, we can control the responses that the SDK returns and test
 * our code in a predictable way.
 */
export class MockOpenAI {
    _choices: any[] = [];

    private constructor() { }

    chat = {
        completions: {
            create: jest.fn().mockImplementation(async () => {

                let closedResolver: undefined | (() => void) = undefined;

                return Promise.resolve({
                    [Symbol.asyncIterator]: () => {
                        // Right now, we don't support async iterators. But we can add support for it in the future.
                        //
                        // return {
                        //     next: async () => {
                        //         if (this._choices.length > 0) {
                        //             return { done: false, value: this._choices.shift() };
                        //         }

                        //         return { done: true };
                        //     }
                        // }
                    },

                    toReadableStream: () => {
                        return {
                            getReader: () => {
                                return {
                                    closed: new Promise<void>((resolve) => {
                                        // need to resolve the promise to simulate the stream closing
                                        closedResolver = () => resolve();
                                    }),

                                    read: async () => {
                                        if (this._choices.length > 0) {
                                            const encoder = new TextEncoder();
                                            const encoded = encoder.encode(JSON.stringify(this._choices.shift()));
                                            return { done: false, value: encoded };
                                        }

                                        setTimeout(() => {
                                            closedResolver?.();
                                        }, 1)

                                        return { done: true };
                                    }
                                }
                            }
                        }
                    },
                });
            })
        }
    }

    /**
     * This method allows us to specify the responses that the SDK should return when it is called.
     * It currently only supports the `chat.completions.create` method. In the future, we may add support
     * for other methods as well.
     * 
     * @returns 
     */
    public static withChoices(choices: any[] = []) {
        class NewMockOpenAI extends MockOpenAI {
            _choices: any[] = [...choices];
        }

        return NewMockOpenAI;
    }
};