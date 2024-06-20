import { ApiClient } from "../../../support/ApiClient";
import { OaiaConfigCommons } from "./Oaia.types";

export class OaiaRunDao {
    constructor(private ctx: OaiaConfigCommons, private apiClient: ApiClient) {

    }
}