import { ApiClient } from "../../../support/ApiClient";
import { OaiaConfigCommonContext } from "./Oaia.types";

export class OaiaRunDao {
    constructor(private ctx: OaiaConfigCommonContext, private apiClient: ApiClient) {

    }
}