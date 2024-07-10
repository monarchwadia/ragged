import { ApiJsonHandler } from "./ApiJsonHandler";
import { FetchRequestFailedError, FetchResponseNotOkError, JsonParseError } from "./RaggedErrors";
import { Logger } from "./logger/Logger";

type BaseHookContext = {
    apiClient: ApiClient;
    requestParams: {
        method: string;
        url: string;
        headers?: RequestInit["headers"];
        body?: any;
    }
}

type BeforeRequestHookContext = {
    request: Request;
} & BaseHookContext;

type AfterResponseHookContext = {
    request: Request;
    response: Response;
} & BaseHookContext;

type AfterResponseParsedHookContext = {
    request: Request;
    response: Response;
    json: any;
} & BaseHookContext;

export type BeforeRequestHook = (context: BeforeRequestHookContext) => Promise<void> | void;
export type AfterResponseHook = (context: AfterResponseHookContext) => Promise<void> | void;
export type AfterResponseParsedHook = (context: AfterResponseParsedHookContext) => Promise<void> | void;

type Hooks = {
    beforeRequest?: BeforeRequestHook;
    afterResponse?: AfterResponseHook;
    afterResponseParsed?: AfterResponseParsedHook;
}

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

    public hooks: Hooks = {};

    async get(url: string, requestInit: ApiClientRequest): Promise<ApiClientResponse> {
        return this.doCall("GET", url, requestInit);
    }

    async post(url: string, requestInit: ApiClientRequest): Promise<ApiClientResponse> {
        return this.doCall("POST", url, requestInit);
    }

    private formatMessage(request: Request, message: string) {
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

        if (this.hooks?.beforeRequest) {
            ApiClient.logger.debug(this.formatMessage(request, "Running beforeRequest hook..."));
            await this.hooks.beforeRequest({
                requestParams: {
                    method,
                    headers: requestInit.headers,
                    body: requestInit.body,
                    url
                },
                request,
                apiClient: this
            });
        }

        let response: Response;
        try {
            response = await fetch(request);
        } catch (e) {
            throw new FetchRequestFailedError("Failed to make fetch call.", e);
        }

        if (this.hooks?.afterResponse) {
            ApiClient.logger.debug(this.formatMessage(request, "Running afterResponse hook..."));
            await this.hooks.afterResponse({
                requestParams: {
                    method,
                    headers: requestInit.headers,
                    body: requestInit.body,
                    url
                },
                request,
                response,
                apiClient: this
            });
        }

        ApiClient.logger.info(this.formatMessage(request, `Response status: ${response.status}`));
        ApiClient.logger.debug(this.formatMessage(request, `Response headers: ${JSON.stringify(response.headers)}`));

        if (!response.ok) {
            ApiClient.logger.error(await response.text())
            throw new FetchResponseNotOkError(response, response.status);
        }

        let json: any;
        try {
            json = await ApiJsonHandler.parseResponse(response);
        } catch (e) {
            ApiClient.logger.error(e);
            throw new JsonParseError("Failed to parse JSON response.", e);
        }

        if (this.hooks?.afterResponseParsed) {
            ApiClient.logger.debug(this.formatMessage(request, "Running afterResponseParsed hook..."));
            await this.hooks.afterResponseParsed({
                requestParams: {
                    method,
                    headers: requestInit.headers,
                    body: requestInit.body,
                    url
                },
                request,
                response,
                apiClient: this,
                json
            });
        }

        return {
            json,
            raw: {
                request,
                response
            }
        }
    }
}