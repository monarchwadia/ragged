
import { FC, FormEvent, SyntheticEvent, forwardRef, useImperativeHandle, useState } from "react";
import { useRagged } from "../react/useRagged"
import { RaggedConfiguration } from "../types";
import { AbstractRaggedDriver } from "../driver/AbstractRaggedDriver";
import { RaggedHistoryItem } from "../driver/types";

/**
 * Unfortunately, Typescript currently does not support inferring Parameter<> types from an overloaded function.
 * So, this is a hacky way of doing what we need.
 */
type Props = {
    useRaggedProps: any;
}

export const UseRaggedTestComponent: FC<Props> = (props, ref) => {
    const r = useRagged(props.useRaggedProps as any);
    const [input, setInput] = useState('');

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        r.chat(input);
    }

    return (
        <div>
            <form onSubmit={(e) => handleSubmit(e)}>
                <label htmlFor="user-input">User Input</label>
                <input data-testid="user-input" type="text" id="user-input" name="user-input" value={input} onChange={e => setInput(e.target.value)} />
                <button type="submit">Submit</button>
            </form>

            <div data-testid="chat-history">
                {JSON.stringify(r.getChatHistory())}
            </div>

            <div data-testid="live-response">{r.getLiveResponse()}</div>
        </div>
    )
};