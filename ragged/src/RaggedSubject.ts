import { Subject } from "rxjs";
import { RaggedHistoryItem, RaggedLlmStreamEvent } from "./driver/types";

export class RaggedSubject extends Subject<RaggedLlmStreamEvent> {
  first<T extends RaggedLlmStreamEvent["type"]>(
    eventType: T
  ): Promise<Extract<RaggedLlmStreamEvent, { type: T }> | undefined> {
    return new Promise((resolve) => {
      this.subscribe((e) => {
        // console.log("first:: event", e.type)
        if (e.type === eventType) {
          resolve(e as unknown as Extract<RaggedLlmStreamEvent, { type: T }>);
          return;
        }

        if (e.type === "ragged.finished") {
          // if we ever get a "ragged.finished" event, then we know that the stream is done.
          // since we haven't found the event we're looking for, we can resolve with undefined.
          resolve(undefined);
          return;
        }
      });
    });
  }

  async firstText(): Promise<string | undefined> {
    const e = await this.first("text.finished");
    return e?.data;
  }

  async firstToolResult(): Promise<any | undefined> {
    const e = await this.first("tool.finished");
    return e?.data;
  }

  async asHistory(): Promise<RaggedHistoryItem[]> {
    return new Promise((resolve) => {
      this.subscribe((e) => {
        if (e.type === "ragged.finished") {
          // if we ever get a "ragged.finished" event, then we know that the stream is done.
          // since we haven't found the event we're looking for, we can resolve with undefined.
          resolve(e.data);
          return;
        }
      });
    });
  }
}
