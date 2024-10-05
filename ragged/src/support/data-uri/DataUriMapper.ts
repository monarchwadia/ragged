import { DataUriEntity } from "./DataUri.types";

export const mapDataUriEntityToString = (entity: DataUriEntity): string => {
    if (!entity.data) {
        throw new Error(`DataUriEntity must have data property`);
    }

    if (!entity.encoding) {
        throw new Error(`DataUriEntity must have encoding property`);
    }

    if (!entity.mimeType) {
        throw new Error(`DataUriEntity must have mimeType property`);
    }

    switch (entity.encoding) {
        case "base64_data_url":
            return `data:${entity.mimeType};base64,${entity.data}`;
            break;
        default:
            throw new Error(`Unsupported image encoding: ${entity.encoding}. Encodings supported: ["base64_data_url"]`);
    }
}
