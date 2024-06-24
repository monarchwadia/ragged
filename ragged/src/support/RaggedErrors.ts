import { Logger } from "./logger/Logger";

/**
 * Errors for drivers and more.
 */
export class BaseRaggedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "BaseError";
    }
}

/**
 * Thrown when a driver fails to parse JSON.
 */
export class JsonParseError extends BaseRaggedError {
    constructor(message: string, public cause: unknown) {
        super(message);
        this.name = "JsonParseError";
    }
}

export class JsonStringifyError extends BaseRaggedError {
    constructor(message: string, public cause: unknown) {
        super(message);
        this.name = "JsonStringifyError";
    }
}

/**
 * Throw when a request fails with a non-2xx status code.
 */
export class FetchRequestFailedError extends BaseRaggedError {
    constructor(message: string, public cause: unknown) {
        super(message);
        this.name = "FetchRequestFailedError";
    }
}

export class FetchResponseNotOkError extends BaseRaggedError {
    private static logger: Logger = new Logger("FetchResponseNotOkError");
    constructor(public response: Response, public status: number) {
        const errorText = `Received a non-200 response from an API call while doing API call to ${response.url}. Status was ` + status + "."
        super(errorText);
        this.name = "FetchResponseNotOkError";
        response.text()
            .then((txt) => FetchResponseNotOkError.logger.info(errorText + "\r\n" + txt))
            .catch((e) => {
                FetchResponseNotOkError.logger.error(`${errorText}\r\n`, e);
            });
    }
}

export class MappingError extends BaseRaggedError {
    constructor(message: string, public cause?: unknown) {
        super(message);
        this.name = "MappingError";
    }
}

export class UnknownError extends BaseRaggedError {
    constructor(message: string, public cause: unknown) {
        super(message);
        this.name = "UnknownError";
    }
}

export class ParameterValidationError extends BaseRaggedError {
    constructor(message: string) {
        super(message);
        this.name = "ParameterError";
    }
}

export class NotImplementedError extends BaseRaggedError {
    constructor(message: string) {
        super(message);
        this.name = "NotImplementedError";
    }
}

export class RetryError extends BaseRaggedError {
    constructor(message: string) {
        super(message);
        this.name = "RetryError";
    }
}
