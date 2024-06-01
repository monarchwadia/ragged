/**
 * Custom errors for drivers. Drivers can throw these errors to indicate
 * that something went wrong.
 */
class BaseDriverError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "BaseError";
    }
}

/**
 * Thrown when a driver fails to parse JSON.
 */
export class JsonParseError extends BaseDriverError {
    constructor(message: string, public cause: unknown) {
        super(message);
        this.name = "JsonParseError";
    }
}

/**
 * Throw when a request fails with a non-2xx status code.
 */
export class FetchRequestFailedError extends BaseDriverError {
    response: Response;
    constructor(message: string, response: Response) {
        super(message);
        this.name = "FetchRequestFailedError";
        this.response = response;
    }
}