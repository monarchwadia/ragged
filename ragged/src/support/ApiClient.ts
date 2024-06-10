import { ApiJsonHandler } from "./ApiJsonHandler";
import { FetchResponseNotOkError } from "./CustomErrors";

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

        const response = await fetch(url, requestInit);

        if (!response.ok) {
            throw new FetchResponseNotOkError(response, response.status);
        }

        return response;
    }
}