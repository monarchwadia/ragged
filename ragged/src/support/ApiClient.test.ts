import { ApiClient } from "./ApiClient";
import { FetchRequestFailedError, FetchResponseNotOkError } from "./RaggedErrors";
import { objToReadableStream } from "../test/objectToReadableStream";

describe("ApiClient", () => {
  let fetchMock = jest.fn(() => Promise.resolve(new Response()));
  let originalFetch: typeof fetch;
  beforeEach(() => {
    // mock global.fetch
    originalFetch = global.fetch;
    global.fetch = fetchMock;

    fetchMock.mockImplementation(() =>
      Promise.resolve(
        new Response(
          objToReadableStream({
            some: "response",
          })
        )
      )
    );
  });

  afterEach(() => {
    // restore global.fetch
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  describe("post", () => {
    describe("POST", () => {
      let json: any;
      let raw: Awaited<ReturnType<ApiClient['post']>>['raw']

      beforeEach(async () => {
        const returnObj = await new ApiClient().post("https://example.com", {
          body: {
            some: "request",
          },
        });

        json = returnObj.json;
        raw = returnObj.raw;
      });

      it("should have the right json object", () => {
        expect(json).toMatchInlineSnapshot(`
          {
            "some": "response",
          }
        `);
      })

      it("should call fetch with a Request object with the right params.", async () => {
        expect(fetchMock).toHaveBeenCalledTimes(1);
        // get call
        const call = fetchMock.mock.calls[0] as unknown as [Request];
        expect(call[0]).toBeInstanceOf(Request);
        expect(call[0].url).toBe("https://example.com/");
        expect(call[0].method).toBe("POST");
      });

      it('should return the raw request object', () => {
        expect(raw.request).toBeInstanceOf(Request);
        expect(raw.request.url).toBe("https://example.com/");
        expect(raw.request.method).toBe("POST");
      })

      it("should return the raw response object", () => {
        expect(raw.response).toBeInstanceOf(Response);
        expect(raw.response.body).toBeInstanceOf(ReadableStream);
        expect(raw.response.status).toBe(200);
      });

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

  describe("hooks", () => {

    describe("beforeSerialize hook", () => {
      it('should be able to modify the request params, such as raw json object, before they are serialized', async () => {
        const apiClient = new ApiClient();
        apiClient.hooks.beforeSerialize = ({ requestParams }) => {
          requestParams.url = "http://modified.com";
          requestParams.method = "OPTIONS";
          requestParams.body.some = "modified";
        };

        await apiClient.post("https://example.com", {
          body: {
            some: "request",
          }
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(expect.any(Request));

        // @ts-expect-error
        const requestObj: Request = fetchMock.mock.calls[0][0];
        const body = await requestObj.json();
        expect(body).toEqual({ some: "modified" });
        expect(requestObj.url).toBe("http://modified.com/");
        expect(requestObj.method).toBe("OPTIONS");
      });
    });

    describe('beforeRequest hook', () => {
      it('should be able to modify the request before it happens', async () => {
        const apiClient = new ApiClient();
        apiClient.hooks.beforeRequest = ({ request }) => {
          request.headers.set("X-Test", "value");
        };

        await apiClient.post("https://example.com", {
          body: {
            some: "request",
          }
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(expect.any(Request));

        // @ts-expect-error
        const requestObj: Request = fetchMock.mock.calls[0][0];
        expect(requestObj.headers.get("X-Test")).toBe("value");
      })
    });

    describe('afterResponse hook', () => {
      it('should be able to modify the response after it happens', async () => {
        const apiClient = new ApiClient();
        apiClient.hooks.afterResponse = ({ response }) => {
          response.headers.set("X-Test", "value");
        };
        const postResponse = await apiClient.post("https://example.com", {
          body: {
            some: "request",
          }
        });

        expect(postResponse.raw?.response.headers.get("X-Test")).toBe("value");
      })
    });

    describe('afterResponseParsed hook', () => {
      it('should be able to read and modify the JSON response in the afterResponseParsed hook', async () => {
        const apiClient = new ApiClient();
        apiClient.hooks.afterResponseParsed = ({ response, json }) => {
          expect(json).toEqual({ some: "response" });
          json.some = "modified";
        };

        const postResponse = await apiClient.post("https://example.com", {
          body: {
            some: "request",
          }
        });

        expect(postResponse.json).toEqual({ some: "modified" });
      });
    });
  })
});
