import { RaggedTool } from "./RaggedTool";
import { RaggedConfiguration } from "./types";
import { resolveDriver } from "./driver/resolveDriver";

type PredictOptions = {
  tools: RaggedTool[];
  requestOverrides: unknown;
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