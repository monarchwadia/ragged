import type { OaiTool } from "./OpenAiApiTypes.js";
import { OpenAiToolMapper } from "./ToolMapper.js";

describe("ToolMapper", () => {
    it("should map from a Ragged Tool to an OpenAI Tool correctly", () => {
        const expected: OaiTool = {
            type: "function",
            function: {
                name: "tool-1",
                description: "A tool.",
                parameters: {
                    type: "object",
                    properties: {
                        key1: {
                            type: "string",
                            description: "A key."
                        },
                        key2: {
                            type: "number",
                            description: "Another key."
                        }
                    },
                    required: ["key1", "key2"]
                },
            }
        };

        const mapped = OpenAiToolMapper.mapToOpenAi({
            id: "tool-1",
            description: "A tool.",
            handler: () => "OK",
            props: {
                type: "object",
                description: "An object.",
                props: {
                    key1: {
                        type: "string",
                        description: "A key.",
                        required: true,
                    },
                    key2: {
                        type: "number",
                        description: "Another key.",
                        required: true
                    }
                },
            }
        });

        expect(mapped).toMatchObject(expected);
    });

    it("maps undefined props to undefined parameters", () => {
        const mapped = OpenAiToolMapper.mapToOpenAi({
            id: "tool-1",
            description: "A tool.",
            handler: () => "OK",
            props: undefined
        });

        expect(mapped).toMatchObject({
            type: "function",
            function: {
                description: "A tool.",
                name: "tool-1",
                parameters: undefined
            },
        });
    });
});