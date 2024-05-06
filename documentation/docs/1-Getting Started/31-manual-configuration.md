# Manually Configuring the driver

The Ragged object's constructor allows for detailed configuration of each AI API through the `config` key.

```ts
const r = new Ragged({
  provider: "openai",
  config: {
    apiKey: OPENAI_API_KEY,
    // You need the following line if you're in a browser. See OpenAI client docs.
    dangerouslyAllowBrowser: true,
    // openai can be configured using a custom fetch implementation
    fetch: async (url: RequestInfo, init?: RequestInit): Promise<Response> => {
      console.log('About to make a request', url, init);
      const response = await fetch(url, init);
      console.log('Got response', response);
      return response;
    },
  },
});
```

If using a driver, you can do the same thing.

```ts
// with a driver
const driver = new OpenAiRaggedDriver({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
  fetch: async (url: RequestInfo, init?: RequestInit): Promise<Response> => {
    console.log('About to make a request', url, init);
    const response = await fetch(url, init);
    console.log('Got response', response);
    return response;
  },
});

const r = new Ragged(driver);
```