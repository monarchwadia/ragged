import { t } from "./t";

describe("t", () => {
  it("builds properly", () => {
    const schema = t
      .tool()
      .title("adder")
      .description("adds two numbers")
      .inputs({
        a: t.number().description("first number").isRequired(),
        b: t.number().description("second number").isRequired(),
      });

    const toolHolder = schema.build();

    expect(toolHolder.tool).toEqual({
      title: "adder",
      description: "adds two numbers",
      inputs: {
        a: { type: "number", description: "first number", isRequired: true },
        b: { type: "number", description: "second number", isRequired: true },
      },
    });
  });
});
