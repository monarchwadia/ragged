import { ApiClient } from "../../../support/ApiClient";
import { OaiaConfigCommonContext } from "./Oaia.types";

export class OaiaMessageDao {
    constructor(private ctx: OaiaConfigCommonContext, private apiClient: ApiClient) {

    }
}