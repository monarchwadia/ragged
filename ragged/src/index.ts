import { buildOpenAI } from "./buildOpenai";
import type { ClientOptions } from "openai";
import { predictStream } from "./predictStream";
import type { PredictOptions } from "./predictStream";

type RaggedConfiguration = {
  openai: ClientOptions;
};

const handleToolUseFinish = (
  p$: ReturnType<typeof predictStream>,
  opts?: Partial<PredictOptions>
) => {
  p$.subscribe((event) => {
    if (event.type === "tool_use_finish") {
      // console.log("TOOL USE", event.payload);

      const name: string = (event.payload.arguments as any).name;
      const payload: unknown = (event.payload.arguments as any).payload;

      if (!name) {
        console.error(
          `LLM tried to call tool with no name. This is a bug in Ragged's prompt.`
        );
        return;
      }

      if (opts?.tools?.length) {
        const foundTool = opts.tools.find((tool) => tool.getTitle() === name);
        if (!foundTool) {
          console.error(
            `LLM tried to call tool with name ${name} but no such tool was provided.`
          );
          return;
        }
        const handler = foundTool.getHandler();
        if (!handler) {
          console.error(
            `LLM tried to call tool with name ${name} but no handler was set on the tool.`
          );
          return;
        }
        const result = handler(payload);
        // TODO: provide the result to the LLM if in agentic mode
      }
    }
  });
};

export class Ragged {
  constructor(private config: RaggedConfiguration) {}

  predictStream(text: string, opts?: Partial<PredictOptions>) {
    const o = buildOpenAI(this.config.openai);
    const p$ = predictStream(o, text, opts);
    handleToolUseFinish(p$, opts);
    return p$;
  }

  predict(text: string, opts?: Partial<PredictOptions>) {
    const o = buildOpenAI(this.config.openai);
    const p$ = predictStream(o, text, opts);
    handleToolUseFinish(p$, opts);
    return new Promise<string>((resolve) => {
      p$.subscribe((event) => {
        if (event.type === "finished") {
          resolve(event.payload);
        }
      });
    });
  }
}
