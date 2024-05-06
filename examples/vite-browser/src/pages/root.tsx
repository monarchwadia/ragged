import { useRagged } from "../../../../ragged/main";

// can also import unminified
// import { Ragged } from "ragged/unminified";

const { VITE_OPENAI_CREDS } = import.meta.env;

function App() {
  const { chat, getChatHistory } = useRagged({
    provider: "openai",
    config: {
      apiKey: VITE_OPENAI_CREDS,
      dangerouslyAllowBrowser: true,
    },
  })
  // const [prediction, setPrediction] = useState("");

  const doPrediction = () => {
    chat("What is toronto?");
  };

  const chatBubbles = [];
  const history = getChatHistory();
  for (const item of history) {
    if (item.type === "history.text" && item.role !== "system") {
      chatBubbles.push({ isHuman: item.role === "human", text: item.data.text });
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <div>{
        chatBubbles.map((bubble, i) => (
          <div key={i} className={`chat ${bubble.isHuman ? "chat-end" : "chat-start"}`}>
            {bubble.text}
          </div>
        ))
      }</div>
      <div className="btn btn-success w-fit" onClick={doPrediction}>
        Predict
      </div>
    </div>
  );
}

export default App;
