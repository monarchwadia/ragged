import { ApiJsonHandler } from "./ApiJsonHandler";
import { FetchRequestFailedError, FetchResponseNotOkError } from "./RaggedErrors";
import { Logger } from "./logger/Logger";


type ApiClientRequest = {
    headers?: RequestInit["headers"];
    body?: any;
}

type ApiClientResponse = {
    json: any;
    raw: {
        request: Request;
        response: Response;
    }
}

/**
 * This class is passed into each adapter to allow the adapter to make API calls.
 * This is useful for testing, as we can mock this class to return a fake response.
 * Every adapter should use this class to make RESTful API calls.
 */
export class ApiClient {
    static logger: Logger = new Logger('ApiClient');

    async get(url: string, requestInit: ApiClientRequest): Promise<ApiClientResponse> {
        return this.doCall("GET", url, requestInit);
    }

    async post(url: string, requestInit: ApiClientRequest): Promise<ApiClientResponse> {
        return this.doCall("POST", url, requestInit);
    }

    private formatMessage (request: Request, message: string) {
        return `${request.method.toUpperCase()} ${request.url}: ${message}`
    };

    private async doCall(method: string, url: string, apiClientRequest: ApiClientRequest): Promise<ApiClientResponse> {
        const requestInit: RequestInit = {}

        requestInit.method = method;

        if (apiClientRequest.headers) {
            requestInit.headers = apiClientRequest.headers;
        }

        if (apiClientRequest.body) {
            requestInit.body = ApiJsonHandler.stringify(apiClientRequest.body)
        }

        const request: Request = new Request(url, {
            method,
            headers: requestInit.headers,
            body: requestInit.body
        });

        // debug info
        ApiClient.logger.info(this.formatMessage(request, "Sending request..."));
        ApiClient.logger.debug(this.formatMessage(request, `Request body: ${JSON.stringify(request.body)}`));
        ApiClient.logger.debug(this.formatMessage(request, `Request headers: ${JSON.stringify(request.headers)}`));

        let response: Response;
        try {
            response = await fetch(request);
        } catch (e) {
            throw new FetchRequestFailedError("Failed to make fetch call.", e);
        }

        ApiClient.logger.info(this.formatMessage(request, `Response status: ${response.status}`));
        ApiClient.logger.debug(this.formatMessage(request, `Response headers: ${JSON.stringify(response.headers)}`));

        if (!response.ok) {
            ApiClient.logger.error(await response.text())
            throw new FetchResponseNotOkError(response, response.status);
        }

        const json = await ApiJsonHandler.parseResponse(response);

        return {
            json,
            raw: {
                request,
                response
            }
        }
    }
}