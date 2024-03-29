import { useState } from "react";
import { predict, qPredict } from "../llm-functions";

function App() {
  const [prediction, setPrediction] = useState("");

  const doPrediction = async () => {
    // const p$ = predict("What is toronto?");
    // p$.subscribe((event) => {
    //   if (event.type === "collected") {
    //     setPrediction(event.payload);
    //   }
    // });

    const p = await qPredict("What is toronto?");
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
