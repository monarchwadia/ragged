import { ApiJsonHandler } from "./ApiJsonHandler";
import { FetchRequestFailedError, FetchResponseNotOkError } from "./CustomErrors";
import { Logger } from "./logger/Logger";


type PostOpts = {
    headers?: RequestInit["headers"];
    body?: any;
}

/**
 * This class is passed into each driver to allow the driver to make API calls.
 * This is useful for testing, as we can mock this class to return a fake response.
 * Every driver will use this class to make RESTful API calls.
 */
export class ApiClient {
    static logger: Logger = new Logger('ApiClient');

    async post(url: string, request: PostOpts): Promise<any> {
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

        if (!response.ok) {
            throw new FetchResponseNotOkError(response, response.status);
        }

        return ApiJsonHandler.parseResponse(response);
    }
}