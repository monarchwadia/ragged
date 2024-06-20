import { ApiClient } from "../../../support/ApiClient";
import { OaiaConfigCommonContext } from "./Oaia.types";

export class OaiaAssistantDao {
    constructor(private ctx: OaiaConfigCommonContext, private apiClient: ApiClient) {

    }
}