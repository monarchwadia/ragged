import { Subject } from "rxjs";
import {
  RaggedConfigValidationResult,
  RaggedLlmPromisableEvent,
  RaggedLlmStreamEvent,
} from "./types";
import { NewToolBuilder } from "../tool-use/NewToolBuilder";

type PredictOptions<RequestOpts> = {
  tools: NewToolBuilder[];
  requestOverrides?: RequestOpts;
};

type PredictStreamOptions<RequestOpts> = {
  tools: NewToolBuilder[];
  requestOverrides?: RequestOpts;
};

export abstract class AbstractRaggedDriver<ConstructorConfig, RequestOpts> {
  protected config?: ConstructorConfig;

  /**
   * This function should be responsible for validating the configuration options for the LLM provider. If the configuration options are invalid,
   * this method should return an object with `isValid` set to `false` and an array of error messages in `errors`. If the configuration
   * options are valid, this method should save the configuration options and return an object with `isValid` set to `true`.
   * Saving the configuration options should be done in a way that allows the driver to use them later when making predictions.
   */
  abstract initializeAndValidateConfiguration(
    opts: Object
  ): RaggedConfigValidationResult;

  abstract predictStream(
    text: string,
    options?: PredictStreamOptions<RequestOpts>
  ): Subject<RaggedLlmStreamEvent>;

  abstract predict(
    text: string,
    options?: PredictOptions<RequestOpts>
  ): Promise<RaggedLlmPromisableEvent[]>;

  isValid(): boolean {
    return !!this.config;
  }
}
