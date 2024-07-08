export function fakeRawsFactory() {
    return {
        request: new Request("https://not-real.com"),
        response: new Response(new ReadableStream())
    }
}