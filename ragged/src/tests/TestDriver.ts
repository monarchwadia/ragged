import { RaggedSubject } from "../RaggedSubject";
import { AbstractRaggedDriver } from "../driver/AbstractRaggedDriver";
import { RaggedConfigValidationResult, RaggedLlmStreamEvent } from "../driver/types";

export class TestDriver extends AbstractRaggedDriver<any, any> {
    _responseStream: RaggedLlmStreamEvent[] = [];

    initializeAndValidateConfiguration(
        opts: Object,
    ): RaggedConfigValidationResult {
        return { isValid: true };
    }

    chatStream() {
        const subject = new RaggedSubject();

        setTimeout(() => {
            this._responseStream.forEach((e) => {
                subject.next(e);
            });
            subject.complete();
        }, 1)

        return subject;
    }

    setResponseStream(stream: RaggedLlmStreamEvent[]) {
        this._responseStream = stream;
    }
}

export const helloWorldDriver = () => {
    const testDriver = new TestDriver({});
    testDriver.setResponseStream([
        {
            type: "ragged.started"
        },
        {
            type: "text.started",
            index: 0,
        },
        {
            type: "text.chunk",
            index: 0,
            data: "Hello,"
        },
        {
            type: "text.joined",
            index: 0,
            data: "Hello,"
        },
        {
            type: "text.chunk",
            index: 0,
            data: " world!"
        },
        {
            type: "text.finished",
            index: 0,
            data: "Hello, world!"
        },
        {
            type: "ragged.finished",
            data: [
                {
                    type: "history.text",
                    role: "ai",
                    data: {
                        text: "Hello, world!"
                    }
                }
            ]
        }
    ]);
    return testDriver;
}