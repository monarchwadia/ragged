import { useState } from "react";
import { quickPredict } from "../llm-functions";

function App() {
  const [prediction, setPrediction] = useState("");

  const doPrediction = async () => {
    const p = await quickPredict("What is toronto?");
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
