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

  chatStream(text: string, options?: PredictOptions) {
    const driver = this.getValidatedDriver();
    const p$ = driver.chatStream(text, options);
    return p$;
  }

  chat(text: string, options?: PredictOptions) {
    const driver = this.getValidatedDriver();
    return driver.chat(text, options);
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
