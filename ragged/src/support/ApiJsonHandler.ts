import { JsonParseError, JsonStringifyError } from "./RaggedErrors";
import { Logger } from "./logger/Logger";

export class ApiJsonHandler {
    static logger: Logger = new Logger('AdapterJsonHandler');

    static parse(json: string): any {
        ApiJsonHandler.logger.debug(`Parsing JSON: ${json}`);
        try {
            return JSON.parse(json);
        } catch (e) {
            const err = new JsonParseError("Failed to parse JSON.", e);
            throw err;
        }
    }

    static stringify(obj: any): string {
        ApiJsonHandler.logger.debug(`Stringifying object to JSON:`, obj);
        try {
            return JSON.stringify(obj);
        } catch (e) {
            const err = new JsonStringifyError("Failed to stringify JSON.", e);
            throw err;
        }
    }

    static async parseResponse(response: Response): Promise<any> {
        ApiJsonHandler.logger.debug(`Parsing response:`, response);
        try {
            const text = await response.text();
            return ApiJsonHandler.parse(text);
        } catch (e) {
            const err = new JsonParseError("Failed to parse JSON response.", e);
            throw err;
        }
    }
}
