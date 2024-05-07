
import { FC, forwardRef, useImperativeHandle } from "react";
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

export const UseRaggedTestComponent: FC<Props> = forwardRef((props, ref) => {
    const r = useRagged(props.useRaggedProps as any);

    useImperativeHandle(ref, () => {
        return r;
    }, [props.useRaggedProps])



    return (<></>)
});