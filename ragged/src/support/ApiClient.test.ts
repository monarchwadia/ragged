import { before } from "node:test";
import { ApiClient } from "./ApiClient";
import { FetchRequestFailedError, FetchResponseNotOkError } from "./RaggedErrors";
import { objToReadableStream } from "../test/objectToReadableStream";
import { Logger } from "./logger/Logger";

describe("ApiClient", () => {
  describe("post", () => {
    let fetchMock = jest.fn(() => Promise.resolve(new Response()));
    let originalFetch: typeof fetch;

    beforeEach(() => {
      // mock global.fetch
      originalFetch = global.fetch;
      global.fetch = fetchMock;
    });

    afterEach(() => {
      // restore global.fetch
      global.fetch = originalFetch;
    });

    it("should successfully parse and return JSON data from a request", async () => {
      fetchMock.mockImplementationOnce(() =>
        Promise.resolve(
          new Response(
            objToReadableStream({
              some: "response",
            })
          )
        )
      );

      const json = await new ApiClient().post("https://example.com", {
        body: {
          some: "request",
        },
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith("https://example.com", {
        body: '{"some":"request"}',
        method: "POST",
      });

      expect(json).toMatchInlineSnapshot(`
        {
          "some": "response",
        }
      `);
    });


    describe.each([300, 301, 400, 401, 404, 500, 503, 504])("Status code %s", (status) => {
      let caught: FetchResponseNotOkError | null = null;
      beforeEach(async () => {
        fetchMock.mockImplementationOnce(() =>
          Promise.resolve(
            new Response(null, {
              status,
            })
          )
        );

        try {
          await new ApiClient().post("https://example.com", {
            body: {
              some: "request",
            },
          });
        } catch (e) {
          caught = e as FetchResponseNotOkError;
        }
      });

      it("should have thrown an instance of FetchResponseNotOkError", () => {
        expect(caught instanceof FetchResponseNotOkError).toBe(true);
      });

      it("should have the correct status code", () => {
        expect(caught?.response?.status).toBe(status);
      });

      it("should have the correct message", () => {
        expect(caught?.message).toBe(
          `Received a non-200 response from an API call while doing API call to . Status was ${status}.`
        );
      });
    });



    describe("fetch request failed altogether error", () => {
      beforeEach(async () => {
        fetchMock.mockImplementationOnce(() =>
          Promise.reject(new Error("Fetch will throw this error"))
        );
      });

      it("should throw an instance of FetchRequestFailedError", async () => {
        let err: FetchRequestFailedError | null = null;

        try {
          await new ApiClient().post("https://example.com", {
            body: {
              some: "request",
            },
          });
        } catch (e) {
          err = e as FetchRequestFailedError;
        }

        expect(err instanceof FetchRequestFailedError).toBe(true);
      });
    });
  });
});
