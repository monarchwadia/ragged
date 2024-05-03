import { Ragged } from "../Ragged";
import { helloWorldDriver } from "./TestDriver";

describe("ragged.chat.simple", () => {
    it("can chat with a string", async () => {
        let driver: any = helloWorldDriver();
        jest.spyOn(driver, "chatStream");
        const r = new Ragged(driver);

        const history = await r.chat("dummy input string").asHistory();
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
        expect(driver.chatStream).toHaveBeenCalledWith([{ "data": { "text": "dummy input string" }, "role": "human", "type": "history.text" }], undefined);
    });
});
