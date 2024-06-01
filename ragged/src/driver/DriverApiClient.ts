export class DriverApiClient {
    post(url: string, request: RequestInit) {
        request.method = "POST";
        return fetch(url, request);
    }
}