# Using the `useRagged` Hook in Ragged

The `useRagged` hook is a powerful tool provided by the Ragged library that allows you to easily interact with AI providers like OpenAI within your React applications. In this tutorial, we'll explore how to use the `useRagged` hook to send prompts, receive responses, and manage chat history.

## Prerequisites

Before getting started, make sure you have the following:

- A React project set up with the necessary dependencies (React, react-dom)
- The Ragged library installed in your project

## Step 1: Import the `useRagged` Hook

To begin, import the `useRagged` hook from the Ragged library in your component file.

We will render our component using React's `createRoot` function.

Make sure you have a container element with the ID "out" in your HTML file where the component will be rendered.

```jsx
import React from "react";
import { createRoot } from "react-dom/client";
// highlight-start
import { useRagged } from "../../ragged/main";
// highlight-end

const App = () => {
    return (
        <div>Hello, World.</div>
    )
}

// render the app
const container = document.getElementById("out");
const root = createRoot(container);
root.render(<App />)
```

## Step 2: Configure the `useRagged` Hook

Inside your component, call the `useRagged` hook and provide the necessary configuration options:

```jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { useRagged } from "../../ragged/main";

// highlight-start
const App = () => {
    const { chat, getChatHistory, getLiveResponse } = useRagged({
        provider: "openai",
        config: {
            apiKey: import.meta.env.VITE_OPENAI_CREDS,
            dangerouslyAllowBrowser: true
        }
    });

    return (
        <h1>useRagged Example</h1>
        <p>
            This is an example of using the useRagged hook to interact with the OpenAI API.
            Enter a prompt below and see the response.
        </p>
        <form>
            <label htmlFor="prompt">Prompt:</label>
            <input type="text" name="prompt" id="prompt" placeholder="Enter your prompt here" />
        </form>
    )
}

// render the app
const container = document.getElementById("out");
const root = createRoot(container);
root.render(<App />)
// highlight-end
```

 Here, the `useRagged` hook takes an object with the following properties:
- `provider`: The name of the AI provider you want to use (e.g., "openai").
- `config`: An object containing the configuration options for the selected provider.

In this example, we're using the OpenAI provider and providing an API key and allowing browser usage.

The `useRagged` hook takes the same arguments as `new Ragged(...)`. In this example, we are instantiating with a config object, but we could also instantiate using a Ragged driver.

## Step 3: Implement the Chat Functionality

To send prompts and receive responses, you can use the `chat` function returned by the `useRagged` hook:

```jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { useRagged } from "../../ragged/main";

const App = () => {
    const { chat, getChatHistory, getLiveResponse } = useRagged({
        provider: "openai",
        config: {
            apiKey: import.meta.env.VITE_OPENAI_CREDS,
            dangerouslyAllowBrowser: true
        }
    });

    // highlight-start
    const handleSubmit = (e) => {
        e.preventDefault();
        const prompt = e.target.prompt.value;
        chat(prompt)
    }
    // highlight-end

    return (
        <h1>useRagged Example</h1>
        <p>
            This is an example of using the useRagged hook to interact with the OpenAI API.
            Enter a prompt below and see the response.
        </p>
        // highlight-start
        <form onSubmit={handleSubmit}>
        // highlight-end
            <label htmlFor="prompt">Prompt:</label>
            <input type="text" name="prompt" id="prompt" placeholder="Enter your prompt here" />
        </form>
    )
}

const container = document.getElementById("out");
const root = createRoot(container);
root.render(<App />)
```

In this example, we have a form submission handler that extracts the prompt from the input field and passes it to the `chat` function. The `chat` function sends the prompt to the AI provider and receives the response.

## Step 4: Display Chat History and Live Response

To display the chat history and live response, you can use the `getChatHistory` and `getLiveResponse` functions returned by the `useRagged` hook:

```jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { useRagged } from "../../ragged/main";

const App = () => {
    const { chat, getChatHistory, getLiveResponse } = useRagged({
        provider: "openai",
        config: {
            apiKey: import.meta.env.VITE_OPENAI_CREDS,
            dangerouslyAllowBrowser: true
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const prompt = e.target.prompt.value;
        chat(prompt)
    }

    return (
        <h1>useRagged Example</h1>
        <p>
            This is an example of using the useRagged hook to interact with the OpenAI API.
            Enter a prompt below and see the response.
        </p>
        <form onSubmit={handleSubmit}>
            <label htmlFor="prompt">Prompt:</label>
            <input type="text" name="prompt" id="prompt" placeholder="Enter your prompt here" />
        </form>
        // highlight-start
        <div>
            <div>
                {getChatHistory()
                    .filter((item) => item.type === "history.text" && item.role !== "system").map((item, index) => {
                        return (
                            <div key={index}>
                                <p>{item.data.text}</p>
                            </div>
                        )
                    })}
                <div>
                    <p>{getLiveResponse()}</p>
                </div>
            </div>
        </div>
        // highlight-end
    )
}

const container = document.getElementById("out");
const root = createRoot(container);
root.render(<App />)
```

The `getChatHistory` function returns an array of chat history items. In this example, we filter the history items to include only text messages (excluding system messages) and render them as paragraphs.

The `getLiveResponse` function returns the current live response from the AI provider, which is rendered as a paragraph.

That's it! You now have a basic setup for using the `useRagged` hook to interact with an AI provider in your React application. You can customize the UI, add more features, and explore other configuration options provided by the Ragged library to enhance your chat functionality.