import { Ragged } from "../Ragged";
import { helloWorldDriver } from "./TestDriver";

describe("ragged.chat", () => {
  describe("asHistory", () => {
    it("returns with a correct response", async () => {
      const driver = helloWorldDriver();

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
    });

    it("translates the string into a history object, which is then passed into the driver.", async () => {
      let driver: any = helloWorldDriver();
      jest.spyOn(driver, "chatStream");

      const r = new Ragged(driver);
      await r.chat("dummy input string").asHistory();

      expect(driver.chatStream).toHaveBeenCalledWith([{ "data": { "text": "dummy input string" }, "role": "human", "type": "history.text" }], undefined);
    });
  })

  describe("firstText", () => {
    it("correctly returns the response as text", async () => {
      const r = new Ragged(helloWorldDriver());
      const text = await r.chat("").firstText();
      expect(text).toBe("Hello, world!");
    });
  })
});

