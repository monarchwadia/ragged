import { Subject } from "rxjs";
import { RaggedConfigValidationResult, RaggedLlmStreamEvent } from "./types";

export abstract class AbstractRaggedDriver {
  /**
   * Called when the RaggedDriver is initialized, which happens after construction but before usage.
   */
  abstract onInitialization(): void;

  /**
   * Indicates whether the driver supports streaming. If this returns false, the driver will be used in non-streaming mode.
   * If it is used in streaming mode, then Ragged will throw an error indicating that streaming is not supported.
   */
  abstract isStreamingSupported(): boolean;

  /**
   * Validates the configuration options for the driver. If the configuration options are invalid, this method should return
   * an object with `isValid` set to `false` and an array of error messages in `errors`. If the configuration options are valid,
   * this method should return an object with `isValid` set to `true`.
   */
  abstract validateConfigurationOptions(
    opts: Object
  ): RaggedConfigValidationResult;

  abstract predictStream(
    text: string,
    overrides?: any
  ): Subject<RaggedLlmStreamEvent>;
}
