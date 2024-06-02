/**
 * This class is passed into each driver to allow the driver to make API calls.
 * This is useful for testing, as we can mock this class to return a fake response.
 * Every driver will use this class to make RESTful API calls.
 */
export class ApiClient {
    post(url: string, request: RequestInit) {
        request.method = "POST";
        return fetch(url, request);
    }
}