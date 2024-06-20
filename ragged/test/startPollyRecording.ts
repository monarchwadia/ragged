import { Polly } from "@pollyjs/core";
import FetchAdapter from "@pollyjs/adapter-fetch";
import FSPersister from "@pollyjs/persister-fs";
import { Logger } from "../src/support/logger/Logger";

/*
  Register the adapters and persisters we want to use. This way all future
  polly instances can access them by name.
*/
Polly.register(FetchAdapter);
Polly.register(FSPersister);

const logger = new Logger("startPollyRecording");

type PollyOptions = {
    refresh?: boolean;
    persistErrors?: boolean;
    matchRequestsBy?: {
        headers?: boolean;
        body?: boolean;
        order?: boolean;
    };
}
export const startPollyRecording = (recordingName: string, opts: PollyOptions = {}) => {
    const config: ConstructorParameters<typeof Polly>[1] = {
        adapters: ["fetch"],
        persister: "fs",
        matchRequestsBy: {
            headers: opts.matchRequestsBy?.headers ?? false,
            body: opts.matchRequestsBy?.body ?? false,
            order: opts.matchRequestsBy?.order ?? false,
        },
        logLevel: "ERROR"
    };

    if (opts.refresh || process.env.REFRESH_POLLY_RECORDINGS === "true") {
        logger.warn("Polly is in refresh mode. This will overwrite any existing recordings. Be careful! This is a destructive operation, and may incur API costs and deplete rate limits if hitting a paid API.");
        config.mode = 'record';
    }

    if (opts.persistErrors) {
        config.recordFailedRequests = true;
    }

    const polly = new Polly(
        recordingName,
        config
    );
    polly.server.any().on("beforeResponse", (req) => {
        // mask auth header
        if (req.headers["authorization"]) {
            req.headers["authorization"] = "Bearer <redacted>";
        }
    });
    return polly;
}