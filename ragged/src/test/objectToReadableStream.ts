export const objToReadableStream = (obj: any) => {
    const json = JSON.stringify(obj);
    const uint8Array = new TextEncoder().encode(json); // Convert string to Uint8Array
    // create a new readable stream from a Uint8Array
    const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(uint8Array);
            controller.close();
        },
    });
    return stream;
};