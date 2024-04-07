class RaggedToolCompilationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RaggedToolCompilationError";
  }
}

type Jsonable =
  | string
  | number
  | boolean
  | null
  | Jsonable[]
  | { [key: string]: Jsonable };

type UsageExample = {
  input: Jsonable;
  output: Jsonable;
  description?: string;
};

export class RaggedTool {
  private _title: string | undefined = undefined;
  private _examples: UsageExample[] = [];
  private _handler: Function | undefined = undefined;

  constructor() {}

  title(title: string) {
    // title can only use 0-9, a-z, A-Z, underscores, and dashes
    if (!/^[0-9a-zA-Z_-]+$/.test(title)) {
      throw new RaggedToolCompilationError(
        `Title "${title}" contains invalid characters. Titles can only use 0-9, a-z, A-Z, underscores, and dashes.`
      );
    }

    this._title = title;
    return this;
  }

  example(example: UsageExample) {
    this._examples.push(example);
    return this;
  }

  handler(handler: Function) {
    this._handler = handler;
    return this;
  }

  compile() {
    if (!this._title) {
      throw new RaggedToolCompilationError(
        "Could not compile tool without a title. Check that you have called `title()` to set the title of this tool."
      );
    }

    if (!this._handler) {
      throw new RaggedToolCompilationError(
        "Could not compile tool without a handler. Check that you have called `handler()` to set the handler of this tool."
      );
    }

    let compiled = "";

    // add title
    compiled += `# ${this._title}\n\n`;

    // add examples
    this._examples.forEach((example, i) => {
      compiled += `## Example ${i}\n\n`;
      if (example.description) {
        compiled += `${example.description}\n\n`;
      }
      compiled += `### Input\n\n\`\`\`\n${JSON.stringify(
        example.input,
        null,
        2
      )}\n\`\`\`\n\n`;
      compiled += `### Output\n\n\`\`\`\n${JSON.stringify(
        example.output,
        null,
        2
      )}\n\`\`\`\n\n`;
    });

    return compiled;
  }
}
