import { JsonParseError, JsonStringifyError } from "./CustomErrors";
import { Logger } from "./logger/Logger";

export class ApiJsonHandler {
    static logger: Logger = new Logger('AdapterJsonHandler');

    static parse(json: string): any {
        try {
            return JSON.parse(json);
        } catch (e) {
            const err = new JsonParseError("Failed to parse JSON.", e);
            throw err;
        }
    }

    static stringify(obj: any): string {
        try {
            return JSON.stringify(obj);
        } catch (e) {
            const err = new JsonStringifyError("Failed to stringify JSON.", e);
            throw err;
        }
    }

    static async parseResponse(response: Response): Promise<any> {
        try {
            const text = await response.text();
            return ApiJsonHandler.parse(text);
        } catch (e) {
            const err = new JsonParseError("Failed to parse JSON response.", e);
            throw err;
        }
    }
}
