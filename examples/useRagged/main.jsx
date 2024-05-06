import { useRagged } from "../../ragged/main";
import React from "react";
import { createRoot } from "react-dom/client";

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
        console.log(prompt);
    }

    return (
        <div>
            <h1>useRagged Example</h1>
            <p>
                This is an example of using the useRagged hook to interact with the OpenAI API.
                Enter a prompt below and see the response.
            </p>
            <form onSubmit={handleSubmit}>
                <label htmlFor="prompt">Prompt:</label>
                <input type="text" name="prompt" id="prompt" placeholder="Enter your prompt here" />
            </form>

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
    )
}

const container = document.getElementById("out");
const root = createRoot(container);
root.render(<App />)