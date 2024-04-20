import { Subject } from "rxjs";
import { RaggedConfigValidationResult, RaggedLlmStreamEvent } from "./types";
import { RaggedTool } from "../RaggedTool";

type PredictOptions<RequestOpts> = {
  tools: RaggedTool[];
  requestOverrides: RequestOpts;
};

type PredictStreamOptions<RequestOpts> = {
  tools: RaggedTool[];
  requestOverrides: RequestOpts;
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
    options?: PredictStreamOptions<RequestOpts>
  ): Promise<string>;

  isValid(): boolean {
    return !!this.config;
  }
}
