import { ApiClient } from "../../../support/ApiClient";
import { OaiaConfigCommonContext } from "./Oaia.types";

export class OaiaThreadDao {
    constructor(private ctx: OaiaConfigCommonContext, private apiClient: ApiClient) {

    }
}