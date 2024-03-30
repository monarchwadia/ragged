import { useState } from "react";
import { Ragged } from "ragged";

// can also import unminified
// import { Ragged } from "ragged/unminified";

const { VITE_OPENAI_CREDS } = import.meta.env;

const l = new Ragged({
  openai: {
    apiKey: VITE_OPENAI_CREDS,
    dangerouslyAllowBrowser: true,
  },
});

function App() {
  const [prediction, setPrediction] = useState("");

  const doPredictionPromiseBased = async () => {
    const p = await l.qPredict("What is toronto?");
    setPrediction(p);
  };

  const doPredictionEventDriven = async () => {
    const p = l.predict("What is toronto?");
    p.subscribe((e) => {
      // the "started" event is emitted when the prediction starts
      if (e.type === "started") {
        // no-op
      }

      // WIP
      // doesn't get emitted yet, but will in the future
      // the "collected" event is emitted with the partially complete prediction as it streams down
      if (e.type === "collected") {
        setPrediction(e.payload);
        // Toronto
        // Toronto is
        // Toronto is a
        // Toronto is a city
        // Toronto is a city in
        // etc
      }

      // the "completed" event is emitted with the fully complete prediction
      if (e.type === "finished") {
        setPrediction(e.payload);
        // Toronto is a city in Canada.
      }
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <div>{prediction}</div>
      <div className="btn btn-success" onClick={doPredictionEventDriven}>
        Predict Streaming
      </div>
      <div className="btn btn-success" onClick={doPredictionPromiseBased}>
        Predict Async
      </div>
    </div>
  );
}

export default App;
