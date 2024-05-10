import {
  RaggedConfigValidationResult,
  RaggedHistoryItem,
  RaggedLlmStreamEvent,
} from "./types";
import { NewToolBuilder } from "../tool-use/NewToolBuilder";
import { RaggedObservable } from "../RaggedObservable";

type PredictOptions<RequestOpts> = {
  tools: NewToolBuilder[];
  requestOverrides?: RequestOpts;
};

type PredictStreamOptions<RequestOpts> = {
  tools: NewToolBuilder[];
  requestOverrides?: RequestOpts;
};

export class InvalidConfigurationError extends Error {
  constructor(errors: string[]) {
    super(
      "The configuration you provided to Ragged was invalid: " +
      errors.join("\n")
    );
  }
}

export abstract class AbstractRaggedDriver<ConstructorConfig extends Object = any, RequestOpts = any> {
  constructor(protected config: ConstructorConfig) {
    const validationResult = this.initializeAndValidateConfiguration(config);
    if (!validationResult.isValid) {
      throw new InvalidConfigurationError(validationResult.errors);
    }
  }

  /**
   * This function should be responsible for validating the configuration options for the LLM provider. If the configuration options are invalid,
   * this method should return an object with `isValid` set to `false` and an array of error messages in `errors`. If the configuration
   * options are valid, this method should save the configuration options and return an object with `isValid` set to `true`.
   * Saving the configuration options should be done in a way that allows the driver to use them later when making predictions.
   */
  abstract initializeAndValidateConfiguration(
    opts: Object
  ): RaggedConfigValidationResult;

  abstract chatStream(
    history: RaggedHistoryItem[],
    options?: PredictStreamOptions<RequestOpts>
  ): RaggedObservable;

  // abstract chat(
  //   history: RaggedHistoryItem[],
  //   options?: PredictOptions<RequestOpts>
  // ): Promise<RaggedLlmPromisableEvent[]>;

  isValid(): boolean {
    return !!this.config;
  }
}
