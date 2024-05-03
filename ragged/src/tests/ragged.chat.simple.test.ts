import { Ragged } from "../Ragged";
import { TestDriver, helloWorldDriver } from "./TestDriver";

describe("ragged.chat.simple", () => {
  it("can chat with a string", async () => {
    const r = new Ragged(helloWorldDriver());

    const history = await r.chat("").asHistory();
    expect(history).toMatchInlineSnapshot(`
      [
        {
          "data": {
            "text": "Hello, world!",
          },
          "role": "ai",
          "type": "history.text",
        },
      ]
    `);
  });
});
