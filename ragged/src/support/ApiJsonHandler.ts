import { JsonParseError, JsonStringifyError } from "./CustomErrors";
import { Logger } from "./logger/Logger";

export class ApiJsonHandler {
    static logger: Logger = new Logger('AdapterJsonHandler');

    static parse(json: string): any {
        try {
            return JSON.parse(json);
        } catch (e) {
            const err = new JsonParseError("Failed to parse JSON.", e);
            this.logger.error(err);
            throw err;
        }
    }

    static stringify(obj: any): string {
        try {
            return JSON.stringify(obj);
        } catch (e) {
            const err = new JsonStringifyError("Failed to stringify JSON.", e);
            this.logger.error(err);
            throw err;
        }
    }
}