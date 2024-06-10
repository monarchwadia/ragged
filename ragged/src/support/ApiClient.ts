import { ApiJsonHandler } from "./ApiJsonHandler";
import { FetchRequestFailedError, FetchResponseNotOkError } from "./CustomErrors";

/**
 * This class is passed into each driver to allow the driver to make API calls.
 * This is useful for testing, as we can mock this class to return a fake response.
 * Every driver will use this class to make RESTful API calls.
 */
type PostOpts = {
    headers?: RequestInit["headers"];
    body?: any;
}
export class ApiClient {
    async post(url: string, request: PostOpts) {
        let requestInit: RequestInit = {}

        requestInit.method = "POST";

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

        if (response.status < 200 || response.status >= 300) {
            throw new FetchResponseNotOkError(response, response.status);
        }

        return response;
    }
}