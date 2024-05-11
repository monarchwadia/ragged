import { useRagged } from "../../ragged/main";
import React from "react";
import { createRoot } from "react-dom/client";

const ControlButton = ({ status }) => {
    console.log("ControlButton::status", status);
    if (status === "streaming") {
        return (<input type="submit" value="Stop" />)
    }
    if (status === "aborting") {
        return (<input type="submit" value="Stopping..." />)
    }
    return (<input type="submit" value="Send" />);
}

const App = () => {
    const { chat, getChatHistory, getLiveResponse, abort, getStatus } = useRagged({
        provider: "openai",
        config: {
            apiKey: import.meta.env.VITE_OPENAI_CREDS,
            dangerouslyAllowBrowser: true
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (getStatus() === "streaming") {
            abort();
            return;
        }

        if (getStatus() === "aborting") {
            // no-op;
            return;
        }

        // chat
        chat(e.target.prompt.value)
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
                <ControlButton status={getStatus()} />
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