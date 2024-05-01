# Stream Lifecycle Events

Ragged exposes several stream lifecycle events that can be listened to using the `.subscribe()` method. These events provide insights into the progress and status of LLM queries made through the Ragged library.

## Namespacing convention

Ragged uses a namespacing convention to categorize events, with the `.` character acting as a separator. For example, `ragged.start` and `ragged.finished` are related events indicating the start and end of a Ragged request. Similarly, all `text.*` events are associated with text responses streamed from the LLM, and so on.

## ragged.\* events

The `ragged` namespace contains events that signify the overall lifecycle of a Ragged request.

### ragged.started

This event is emitted when a new Ragged request begins. It indicates that the library has started processing the LLM query.

By subscribing to the `ragged.started` and `ragged.finished` events, you can track the overall progress of a Ragged request and perform necessary actions at the start and end of the request.

```ts
export type RaggedResponseStartedEvent = {
  type: "ragged.started";
};
```

#### Example usage:

```ts
const r$ = r.chat("This is a question for the LLM.");

r$.subscribe((e) => {
  if (e.type === "ragged.started") {
    console.log("Ragged request started");
  }
});
```

### ragged.finished

The `ragged.finished` event is triggered when a Ragged request has completed. It provides an array of `RaggedHistoryItem` objects representing the history of the request.

The `ragged.finished` event is particularly useful for performing actions or processing the complete history of the request once it has finished. The `data` property of the event contains an array of `RaggedHistoryItem` objects, which can be used to analyze or store the conversation history.

```ts
export type RaggedResponseFinishedEvent = {
  type: "ragged.finished";
  data: RaggedHistoryItem[];
};
```

#### Example usage:

```ts
const r$ = r.chat("This is a question for the LLM.");

r$.subscribe((e) => {
  if (e.type === "ragged.finished") {
    console.log("Ragged request finished");
    console.log("History:", e.data);
  }
});
```

## text.\* events

Events under the `text` namespace are related to text responses streamed from the LLM.

The `text.*` events provide granular control over the streaming of text responses from the LLM. By subscribing to these events, you can process the text chunks as they arrive (using `text.chunk`), handle the appended text response received up until the current moment (using `text.joined`), and handle the complete text response as well as perform any necessary actions when a text response is finished (using `text.finished`).

### text.started

The `text.started` event is emitted at the beginning of a text response from the LLM. It includes an `index` property indicating the position of the text response within the overall response.

```ts
type RaggedTextStartedEvent = {
  type: "text.started";
  index: number;
};
```

### text.chunk

As the LLM generates text, it is streamed in chunks. The `text.chunk` event is triggered for each chunk of text received. It includes the `index` of the text response and the `data` string representing the chunk of text.

```ts
type RaggedTextChunkEvent = {
  type: "text.chunk";
  index: number;
  data: string;
};
```

#### Example usage:

```ts
const r$ = r.chat("This is a question for the LLM.");

r$.subscribe((e) => {
  if (e.type === "text.chunk") {
    process.stdout.write(e.data);
  }
});
```

### text.joined

The `text.joined` event is a convenience event that is the result of appending all `text.chunk`s received so far. It is emitted right after every `text.chunk` event. It provides the `index` of the text response and the complete `data` string received so far.

```ts
type RaggedTextJoinedEvent = {
  type: "text.joined";
  index: number;
  data: string;
};
```

#### Example usage:

```ts
const r$ = r.chat("This is a question for the LLM.");

r$.subscribe((e) => {
  if (e.type === "text.joined") {
    console.log(`\Response so far at index ${e.index}: ${e.data}`);
  }
});
```

### text.finished

The `text.finished` event is triggered when a text response from the LLM has been fully processed and streamed. It includes the `index` of the text response and the complete `data` string.

```ts
type RaggedTextFinishedEvent = {
  type: "text.finished";
  index: number;
  data: string;
};
```

#### Example usage:

```ts
const r$ = r.chat("This is a question for the LLM.");

r$.subscribe((e) => {
  if (e.type === "text.finished") {
    console.log(
      `Complete text response at index ${e.index} finished: ${e.data}`
    );
  }
});
```

## tool.\* events

The `tool` namespace contains events related to tool usage within Ragged.

The `tool.*` events allow you to monitor and handle the lifecycle of tool executions within Ragged. By subscribing to these events, you can perform actions when a tool starts, access the inputs passed to the tool, and process the result returned by the tool when it finishes.

### tool.started

The `tool.started` event is emitted when a tool begins execution. It provides the `index` of the tool call within the overall response, the `toolCallIndex` indicating the position of the tool call within the current index, and the `data` object containing the `name` of the tool being executed.

```ts
type RaggedToolStartedEvent = {
  type: "tool.started";
  index: number;
  toolCallIndex: number;
  data: {
    name: string;
  };
};
```

#### Example usage:

```ts
p$.subscribe((event) => {
  if (event.type === "tool.started") {
    console.log(`Tool ${event.data.name} started at index ${event.index}`);
  }
});
```

### tool.inputs

The `tool.inputs` event is triggered when all the inputs for a tool have been provided by the LLM. It includes the `index` and the `toolCallIndex` which are the same as those provided in `tool.started`, and the `data` object containing the `name` of the tool and the `arguments` passed to the tool.

```ts
type RaggedToolInputsEvent<Args = any> = {
  type: "tool.inputs";
  index: number;
  toolCallIndex: number;
  data: {
    name: string;
    arguments: Args;
  };
};
```

#### Example usage:

```ts
p$.subscribe((event) => {
  if (event.type === "tool.inputs") {
    console.log(`Tool ${event.data.name} inputs:`, event.data.arguments);
  }
});
```

### tool.finished

The `tool.finished` event is emitted when a tool has completed its execution. It provides the `index` and `toolCallIndex` (see `tool.started` for more information on these), and the `data` object containing the `name` of the tool, the `arguments` passed to the tool, and the `result` returned by the tool.

The `result` will only be populated if the `handler()` was defined.

```ts
type RaggedToolFinishedEvent<Args = any, Result = any> = {
  type: "tool.finished";
  index: number;
  toolCallIndex: number;
  data: {
    name: string;
    arguments: Args;
    result: Result;
  };
};
```

#### Example usage:

```ts
p$.subscribe((event) => {
  if (event.type === "tool.finished") {
    console.log(
      `Tool ${event.data.name} finished with result:`,
      event.data.result
    );
  }
});
```

## history.\*

The `history` namespace contains events that are meant to be stored within the `history` object of Ragged. These events provide a unified interface for all LLMs, allowing for a simpler representation of both outgoing and incoming data.

The `history.*` events provide a standardized way to collect and store conversation history across different LLMs, simplifying the process of working with multiple LLM providers. By leveraging the `history` object and its associated events, you can easily maintain a persistent conversation history and ensure compatibility with various LLMs.

In these examples, we directly push the events into the `history` array. We can do this without any additional type assertions, since the events themselves are already of type `RaggedHistoryItem`. This array can then be passed directly into future Ragged `chat()` requests.

### history.text

The `history.text` event represents a text item in the conversation history. It includes the `role` of the text (either "ai", "human", or "system") and the `data` object containing the `text` string.

```ts
type TextHistoryItem = {
  type: "history.text";
  role: "ai" | "human" | "system";
  data: {
    text: string;
  };
};
```

#### Example usage:

```ts
const history: RaggedHistoryItem[] = [];

p$.subscribe((event) => {
  if (event.type === "text.finished") {
    history.push(event);
  }
});
```

### history.tool.request

The `history.tool.request` event represents a tool request in the conversation history. It includes a unique `toolRequestId`, the `toolName`, and the `inputs` passed to the tool.

```ts
type ToolRequestHistoryItem = {
  type: "history.tool.request";
  toolRequestId: string;
  toolName: string;
  inputs: any;
};
```

#### Example usage:

```ts
const history: RaggedHistoryItem[] = [];

p$.subscribe((event) => {
  if (event.type === "tool.inputs") {
    history.push(event);
  }
});
```

### history.tool.result

The `history.tool.result` event represents the result of a tool execution in the conversation history. It includes the `toolRequestId` (matching the corresponding `history.tool.request` event), the `toolName`, and the `result` returned by the tool.

```ts
export type ToolResultHistoryItem = {
  type: "history.tool.result";
  toolRequestId: string;
  toolName: string;
  result: any;
};
```

#### Example usage:

```ts
const history: RaggedHistoryItem[] = [];

p$.subscribe((event) => {
  if (event.type === "tool.finished") {
    history.push(event);
  }
});
```
