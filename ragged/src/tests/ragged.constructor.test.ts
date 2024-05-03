import { Ragged } from "../Ragged";
import { RaggedSubject } from "../RaggedSubject";
import { AbstractRaggedDriver } from "../driver/AbstractRaggedDriver";
import { OpenAiRaggedDriver } from "../driver/openai/OpenAiRaggedDriver";
import { RaggedConfigValidationResult } from "../driver/types";

describe("ragged.constructor", () => {
  describe("instantiation", () => {
    it("can build using fromConfig", () => {
      const r = new Ragged({
        provider: "openai",
        config: {
          apiKey: "test-api-key",
        },
      });

      expect(r).not.toBeFalsy();
    });

    it("can build using a driver", () => {
      const driver = new OpenAiRaggedDriver({
        apiKey: "test-api-key",
      });
      const r = new Ragged(driver);

      expect(r).not.toBeFalsy();
    });

    it("constructs an OpenAiDriver if provider is openai", () => {
      const r = new Ragged({
        provider: "openai",
        config: {
          apiKey: "test-api-key",
        },
      });

      expect(r._driver).toBeInstanceOf(OpenAiRaggedDriver);
    });

    it("uses the provided driver if it is an instance of AbstractRaggedDriver", () => {
      class TestDriver extends AbstractRaggedDriver<any, any> {
        initializeAndValidateConfiguration(
          opts: Object,
        ): RaggedConfigValidationResult {
          return { isValid: true };
        }
        chatStream() {
          return new RaggedSubject();
        }

      }
      const testDriver = new TestDriver({});
      const r = new Ragged(testDriver);
      expect(r._driver).toBe(testDriver);
    });

    it("throws an error if the driver is not an instance of AbstractRaggedDriver", () => {
      expect(() => {
        // @ts-expect-error
        new Ragged({});
      }).toThrowErrorMatchingInlineSnapshot(
        `"Invalid driver configuration. Please see Ragged documentation for more instructions on how to instantiate the Ragged object."`,
      );
    });
  });
});
