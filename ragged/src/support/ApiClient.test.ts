import { ApiClient } from "./ApiClient";
import { FetchResponseNotOkError } from "./CustomErrors";

const toReadableStream = (obj: any) => {
  const json = JSON.stringify(obj);
  const uint8Array = new TextEncoder().encode(json); // Convert string to Uint8Array
  // create a new readable stream from a Uint8Array
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(uint8Array);
      controller.close();
    },
  });
  return stream;
};

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
            toReadableStream({
              some: "response",
            })
          )
        )
      );

      const response = await new ApiClient().post("https://example.com", {
        body: {
          some: "request",
        },
      });
      const json = await response.json();

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

    describe("non-200 status code error", () => {
      let caught: FetchResponseNotOkError | null = null;

      beforeEach(async () => {
        fetchMock.mockImplementationOnce(() =>
          Promise.resolve(
            new Response(null, {
              status: 500,
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
        expect(caught?.response.status).toBe(500);
      });

      it("should have the correct message", () => {
        expect(caught?.message).toMatchInlineSnapshot(
          `"Received a non-200 response from an API call."`
        );
      });
    })
  });
});
