import { RaggedConfiguration } from "./types";
import { resolveDriver } from "./driver/resolveDriver";
import { NewToolBuilder } from "./tool-use/NewToolBuilder";
import { RaggedHistoryItem, RaggedLlmStreamEvent } from "./driver/types";
import { RaggedSubject } from "./RaggedSubject";
import { AbstractRaggedDriver } from "./driver/AbstractRaggedDriver";

export type ChatOptions = {
  tools: NewToolBuilder[];
  requestOverrides?: any;
};

export class Ragged {
  public _driver: AbstractRaggedDriver;

  constructor(driver: RaggedConfiguration);
  constructor(driver: AbstractRaggedDriver);
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
    options?: ChatOptions
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
