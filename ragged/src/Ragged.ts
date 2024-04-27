import { RaggedConfiguration } from "./types";
import { resolveDriver } from "./driver/resolveDriver";
import { NewToolBuilder } from "./tool-use/NewToolBuilder";

type PredictOptions<Overrides = any> = {
  tools: NewToolBuilder[];
  requestOverrides?: Overrides;
};

export class InvalidConfigurationError extends Error {
  constructor(errors: string[]) {
    super(
      "The configuration you provided to Ragged was invalid: " +
        errors.join("\n")
    );
  }
}

export class Ragged {
  constructor(private config: RaggedConfiguration) {}

  // Need to add new functions and rename the current one
  //
  // chat(chat[], tools?[]) -> promise<chathistory[]>
  // chatStream(chat[], tools?[]) -> subject<chathistory>
  //
  // ask(text:string, tools?[]) -> promise<string>
  // askStream(text:string, tools?[]) -> subject<chunk/joined>
  //
  // useRagged - a hook for react

  predictStream(text: string, options?: PredictOptions) {
    const driver = this.getValidatedDriver();
    const p$ = driver.predictStream(text, options);
    return p$;
  }

  predict(text: string, options?: PredictOptions) {
    const driver = this.getValidatedDriver();
    return driver.predict(text, options);
  }

  private getValidatedDriver() {
    const driver = resolveDriver(this.config);
    const validationResult = driver.initializeAndValidateConfiguration(
      this.config.config
    );
    if (!validationResult.isValid) {
      throw new InvalidConfigurationError(validationResult.errors);
    }
    return driver;
  }
}
