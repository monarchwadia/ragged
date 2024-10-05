import { DataUriEntity } from "./DataUri.types";
import { mapDataUriEntityToString } from "./DataUriMapper";

describe("DataUriMapper", () => {
  describe("mapDataUriEntityToString", () => {
    it("should map correctly", () => {
      const entity: DataUriEntity = {
        encoding: "base64_data_url",
        mimeType: "image/png",
        data: "some-data",
      };
      const result = mapDataUriEntityToString(entity);
      expect(result).toMatchInlineSnapshot(`"data:image/png;base64,some-data"`);
    });

    it("throws when encoding is not supported", () => {
      const entity: DataUriEntity = {
        // @ts-expect-error - testing data
        encoding: "unknown_encoding",
        mimeType: "image/png",
        data: "some-data",
      };
      expect(() =>
        mapDataUriEntityToString(entity)
      ).toThrowErrorMatchingInlineSnapshot(
        `"Unsupported image encoding: unknown_encoding. Encodings supported: ["base64_data_url"]"`
      );
    });

    it("throws when mimeType is not provided", () => {
      const entity: DataUriEntity = {
        encoding: "base64_data_url",
        // @ts-expect-error - testing data
        mimeType: null,
        data: "some-data",
      };
      expect(() =>
        mapDataUriEntityToString(entity)
      ).toThrowErrorMatchingInlineSnapshot(
        `"DataUriEntity must have mimeType property"`
      );
    });

    it("throws when mimeType is not provided", () => {
      const entity: DataUriEntity = {
        encoding: "base64_data_url",
        mimeType: "image/png",
        // @ts-expect-error - testing data
        data: undefined,
      };
      expect(() =>
        mapDataUriEntityToString(entity)
      ).toThrowErrorMatchingInlineSnapshot(
        `"DataUriEntity must have data property"`
      );
    });
  });
});
