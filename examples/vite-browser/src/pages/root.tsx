import { useState } from "react";
import { Ragged } from "ragged";
const { VITE_OPENAI_CREDS } = import.meta.env;

const l = new Ragged({
  openai: {
    apiKey: VITE_OPENAI_CREDS,
    dangerouslyAllowBrowser: true,
  },
});

function App() {
  const [prediction, setPrediction] = useState("");

  const doPrediction = async () => {
    const p = await l.qPredict("What is toronto?");
    setPrediction(p);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <div>{prediction}</div>
      <div className="btn btn-success" onClick={doPrediction}>
        Predict
      </div>
    </div>
  );
}

export default App;
