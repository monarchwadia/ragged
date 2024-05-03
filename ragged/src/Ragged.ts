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
  private driver: AbstractRaggedDriver<DriverConfig, unknown>;

  constructor(driver: RaggedConfiguration | AbstractRaggedDriver<any, unknown>) {
    if (driver instanceof AbstractRaggedDriver) {
      this.driver = driver;
    } else {
      this.driver = resolveDriver(driver);
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

    const p$ = this.driver.chatStream(history, options);
    return p$;
  }
}
