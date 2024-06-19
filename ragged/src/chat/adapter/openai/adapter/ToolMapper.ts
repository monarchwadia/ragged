import { Logger } from "../../../../support/logger/Logger";
import { ObjectProp, Tool, ToolProp } from "../../../../tools";
import { OaiTool, OaiToolParam, OaiToolParamObject } from "./OpenAiApiTypes";

export class OpenAiToolMapper {
    private static logger: Logger = new Logger("OpenAiToolMapper");

    static mapToOpenAi(tool: Tool): OaiTool {
        return {
            type: "function",
            function: {
                name: tool.id,
                description: tool.description,
                parameters: OpenAiToolMapper.mapPropToOaiParameter(tool.props)
            }
        }
    }

    private static mapPropToOaiParameter(prop: ToolProp): OaiToolParam | undefined {
        switch (prop?.type) {
            case "string":
                return {
                    type: "string",
                    description: prop.description
                }
            case "number":
                return {
                    type: "number",
                    description: prop.description
                }
            case "boolean":
                return {
                    type: "boolean",
                    description: prop.description
                }
            case "object":
                return OpenAiToolMapper.mapObjectPropsToOaiObjectParam(prop);
            case "array":
                return {
                    type: "array",
                    description: prop.description,
                    items: OpenAiToolMapper.mapPropToOaiParameter(prop.children)
                }
            case undefined:
                return undefined;
            default:
                OpenAiToolMapper.logger.warn(`Unknown and unhandled tool prop type: ${(prop as any)?.type}. This will not get sent to OpenAI. Here is what the prop looked like:`, prop);
                break;
        }
    }

    private static mapObjectPropsToOaiObjectParam(obj: ObjectProp): OaiToolParamObject {
        const rootObj: OaiToolParamObject = {
            type: "object",
            properties: {} as OaiToolParamObject['properties']
        }
        for (const key in obj.props) {
            const prop = obj.props[key];

            if (prop?.required) {
                if (!rootObj.required) {
                    rootObj.required = [];
                }
                rootObj.required.push(key);
            }

            rootObj.properties[key] = OpenAiToolMapper.mapPropToOaiParameter(prop) as OaiToolParam;
        }

        return rootObj;
    }
}