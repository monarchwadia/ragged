import { t } from "./t";

describe("t", () => {
  it("allows", () => {
    const schema = t
      .tool()
      .title("adder")
      .description("adds two numbers")
      .inputs({
        a: t.number().description("first number").isRequired(),
        b: t.number().description("second number").isRequired(),
      });

    const newTool = schema.build();

    expect(newTool).toEqual({
      title: "adder",
      description: "adds two numbers",
      inputs: {
        a: { type: "number", description: "first number", isRequired: true },
        b: { type: "number", description: "second number", isRequired: true },
      },
    });
  });
});
