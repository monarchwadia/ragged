import { RaggedConfiguration } from "./types";
import { resolveDriver } from "./driver/resolveDriver";
import { NewToolBuilder } from "./tool-use/NewToolBuilder";
import { RaggedHistoryItem, RaggedLlmStreamEvent } from "./driver/types";
import { RaggedSubject } from "./RaggedSubject";
import { AbstractRaggedDriver } from "./driver/AbstractRaggedDriver";

type PredictOptions<Overrides = any> = {
  tools: NewToolBuilder[];
  requestOverrides?: Overrides;
};

export class Ragged<DriverConfig extends Object> {
  public _driver: AbstractRaggedDriver<DriverConfig, unknown>;

  constructor(driver: RaggedConfiguration);
  constructor(driver: AbstractRaggedDriver<any, unknown>);
  constructor(driver: any) {
    if (driver instanceof AbstractRaggedDriver) {
      this._driver = driver;
    } else if (driver.provider) {
      this._driver = resolveDriver(driver);
    } else {
      throw new Error("Invalid driver configuration. Please see Ragged documentation for more instructions on how to instantiate the Ragged object.");
    }
  }

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

    const p$ = this._driver.chatStream(history, options);
    return p$;
  }
}
