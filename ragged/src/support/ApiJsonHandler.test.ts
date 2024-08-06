import { ApiJsonHandler } from "./ApiJsonHandler";
import { JsonParseError, JsonStringifyError } from "./RaggedErrors";

describe("ApiJsonHandler", () => {
  describe("parse", () => {
    it("should parse a JSON string", () => {
      const json = '{"key": "value"}';
      const obj = ApiJsonHandler.parse(json);
      expect(obj).toEqual({ key: "value" });
    });

    it("should throw a JsonParseError error when parsing an invalid JSON string", () => {
      const json = '{"key": "value"';
      expect(() => ApiJsonHandler.parse(json)).toThrow(JsonParseError);
    });
  });

  describe("stringify", () => {
    it("should stringify an object", () => {
      const obj = { key: "value" };
      const json = ApiJsonHandler.stringify(obj);
      expect(json).toMatchInlineSnapshot(`
        "{
          "key": "value"
        }"
      `);
    });

    it("should throw a JsonStringifyError error when stringifying an invalid object", () => {
      const circularRef = {} as any;
      circularRef.circularRef = circularRef;
      const obj = circularRef; // circular reference is not supported in JSON
      expect(() => ApiJsonHandler.stringify(obj)).toThrow(JsonStringifyError);
    });
  });

  describe("parseResponse", () => {
    it("should parse a JSON response", () => {
      const json = '{"key": "value"}';
      const response = new Response(json);
      return ApiJsonHandler.parseResponse(response).then((obj) => {
        expect(obj).toEqual({ key: "value" });
      });
    });

    it("should throw a JsonParseError error when parsing an invalid JSON response", () => {
      const json = '{"key": "value"';
      const response = new Response(json);
      return ApiJsonHandler.parseResponse(response).catch((err) => {
        expect(err).toBeInstanceOf(JsonParseError);
      });
    });
  });
});
