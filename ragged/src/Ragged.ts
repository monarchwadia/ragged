import { RaggedConfiguration } from "./types";
import { resolveDriver } from "./driver/resolveDriver";
import { NewToolBuilder } from "./tool-use/NewToolBuilder";
import { RaggedHistoryItem, RaggedLlmStreamEvent } from "./driver/types";
import { RaggedSubject } from "./RaggedSubject";

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

  chat(
    history: RaggedHistoryItem[] | string,
    options?: PredictOptions
  ): RaggedSubject {
    if (typeof history === "string") {
      history = [
        {
          type: "history.text",
          role: "human",
          data: {
            text: history,
          },
        },
      ];
    }
    const driver = this.getValidatedDriver();
    const p$ = driver.chatStream(history, options);
    return p$;
  }

  // chat(
  //   history: RaggedHistoryItem[] | string,
  //   options?: PredictOptions
  // ): Promise<RaggedLlmStreamEvent[]> {
  //   if (typeof history === "string") {
  //     history = [
  //       {
  //         type: "history.text",
  //         role: "human",
  //         data: {
  //           text: history,
  //         },
  //       },
  //     ];
  //   }
  //   const driver = this.getValidatedDriver();
  //   return driver.chat(history, options);
  // }

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
