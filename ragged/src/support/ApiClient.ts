import { ApiJsonHandler } from "./ApiJsonHandler";
import { FetchRequestFailedError, FetchResponseNotOkError } from "./RaggedErrors";
import { Logger } from "./logger/Logger";


type PostOpts = {
    headers?: RequestInit["headers"];
    body?: any;
}

/**
 * This class is passed into each adapter to allow the adapter to make API calls.
 * This is useful for testing, as we can mock this class to return a fake response.
 * Every adapter should use this class to make RESTful API calls.
 */
export class ApiClient {
    static logger: Logger = new Logger('ApiClient');

    async get(url: string, request: PostOpts): Promise<any> {
        return this.doCall("GET", url, request);
    }

    async post(url: string, request: PostOpts): Promise<any> {
        return this.doCall("POST", url, request);
    }

    private async doCall(method: string, url: string, request: PostOpts): Promise<Response> {
        const requestInit: RequestInit = {}

        requestInit.method = method;

        if (request.headers) {
            requestInit.headers = request.headers;
        }

        if (request.body) {
            requestInit.body = ApiJsonHandler.stringify(request.body)
        }

        let response: Response | null = null;
        try {
            response = await fetch(url, requestInit);
        } catch (e) {
            throw new FetchRequestFailedError("Failed to make fetch call.", e);
        }

        if (!response.ok) {
            ApiClient.logger.error(await response.text())
            throw new FetchResponseNotOkError(response, response.status);
        }

        return ApiJsonHandler.parseResponse(response);
    }
}