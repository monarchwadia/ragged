import {
  DuplicateToolError,
  ToolExecutor,
  ToolNotFoundError,
} from "./ToolExecutor";

describe("ToolExecutor", () => {
  describe("executeTool", () => {
    it("returns the result of the execution correctly", () => {
      const toolExecutor = new ToolExecutor();

      toolExecutor.addTool({
        name: "AddOne",
        description: "Tool that adds one to a number",
        inputValidator: (input) => typeof input === "number",
        handler: (input) => (input as number) + 1,
      });

      const result = toolExecutor.executeTool("AddOne", 1);

      expect(result).toBe(2);
    });

    it("throws a ToolNotFoundError if the tool does not exist", () => {
      const toolExecutor = new ToolExecutor();

      expect(() => {
        toolExecutor.executeTool("A non-existent tool", null);
      }).toThrow(ToolNotFoundError);
    });

    it("catches any errors that may be thrown during execution", () => {
      expect(() => {
        const toolExecutor = new ToolExecutor();

        toolExecutor.addTool({
          name: "ErrorTool",
          description: "Tool that throws an error",
          inputValidator: () => true,
          handler: () => {
            throw new Error("ErrorTool error");
          },
        });

        toolExecutor.executeTool("ErrorTool", null);
      }).not.toThrow();
    });
  });
  describe("addTool", () => {
    it("throws an error if a tool with the same name is added twice", () => {
      const toolExecutor = new ToolExecutor();

      toolExecutor.addTool({
        name: "adder",
        description: "Tool that adds one to a number",
        inputValidator: (input) => typeof input === "number",
        handler: (input) => (input as number) + 1,
      });

      expect(() => {
        toolExecutor.addTool({
          name: "adder",
          description: "Another tool that adds one to a number",
          inputValidator: (input) => typeof input === "number",
          handler: (input) => (input as number) + 1,
        });
      }).toThrow(DuplicateToolError);
    });
  });
});
