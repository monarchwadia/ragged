export class MockOpenAI {
    _choices: any[] = [];

    chat = {
        completions: {
            create: jest.fn().mockImplementation(async () => {

                return {
                    [Symbol.asyncIterator]: () => {
                        return {
                            next: async () => {
                                if (this._choices.length > 0) {
                                    return { done: false, value: this._choices.shift() };
                                }

                                return { done: true };
                            }
                        }
                    },
                };
            })
        }
    }

    public static withChoices(choices: any[] = []) {
        class NewMockOpenAI extends MockOpenAI {
            _choices: any[] = [...choices];
        }

        return NewMockOpenAI;
    }
};