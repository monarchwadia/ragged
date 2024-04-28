import { Subject } from "rxjs";
import { RaggedLlmStreamEvent } from "./driver/types";

export class RaggedSubject extends Subject<RaggedLlmStreamEvent> {
  first<T extends RaggedLlmStreamEvent["type"]>(
    eventType: T
  ): Promise<Extract<RaggedLlmStreamEvent, { type: T }> | undefined> {
    return new Promise((resolve) => {
      this.subscribe((e) => {
        if (e.type === eventType) {
          resolve(e as unknown as Extract<RaggedLlmStreamEvent, { type: T }>);
        }

        if (e.type === "finished") {
          resolve(undefined);
        }
      });
    });
  }
}
