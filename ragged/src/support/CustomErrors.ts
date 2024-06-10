/**
 * Custom errors for drivers. Drivers can throw these errors to indicate
 * that something went wrong.
 */
export class BaseCustomError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "BaseError";
    }
}

/**
 * Thrown when a driver fails to parse JSON.
 */
export class JsonParseError extends BaseCustomError {
    constructor(message: string, public cause: unknown) {
        super(message);
        this.name = "JsonParseError";
    }
}

export class JsonStringifyError extends BaseCustomError {
    constructor(message: string, public cause: unknown) {
        super(message);
        this.name = "JsonStringifyError";
    }
}

/**
 * Throw when a request fails with a non-2xx status code.
 */
export class FetchRequestFailedError extends BaseCustomError {
    constructor(message: string, public cause: unknown) {
        super(message);
        this.name = "FetchRequestFailedError";
    }
}

export class FetchResponseNotOkError extends BaseCustomError {
    constructor(public response: Response, public status: number) {
        super("Received a non-200 response from an API call. Status was " + status + ".");
        this.name = "FetchResponseNotOkError";
    }
}

export class MappingError extends BaseCustomError {
    constructor(message: string, public cause: unknown) {
        super(message);
        this.name = "MappingError";
    }
}

export class UnknownError extends BaseCustomError {
    constructor(message: string, public cause: unknown) {
        super(message);
        this.name = "UnknownError";
    }
}

export class ParameterValidationError extends BaseCustomError {
    constructor(message: string) {
        super(message);
        this.name = "ParameterError";
    }
}