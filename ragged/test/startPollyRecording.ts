import { Polly } from "@pollyjs/core";
import FetchAdapter from "@pollyjs/adapter-fetch";
import FSPersister from "@pollyjs/persister-fs";

/*
  Register the adapters and persisters we want to use. This way all future
  polly instances can access them by name.
*/
Polly.register(FetchAdapter);
Polly.register(FSPersister);

export const startPollyRecording = (recordingName: string) => {
    const polly = new Polly(
        recordingName,
        {
            adapters: ["fetch"],
            persister: "fs",
            matchRequestsBy: {
                headers: false,
                body: false,
                order: false,
            },
            logLevel: "ERROR"
        }
    );
    polly.server.any().on("beforeResponse", (req) => {
        // mask auth header
        if (req.headers["authorization"]) {
            req.headers["authorization"] = "Bearer <redacted>";
        }
    });
    return polly;
}