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
    const p = await l.predict("What is toronto?");
    setPrediction(p);
  };

  const doPredictionEventDriven = async () => {
    const p = l.predictStream("What is toronto?");

    p.subscribe((e) => {
      console.log("EVENT", e);
      // console.log(e);
      // the "started" event is emitted when the prediction starts
      if (e.type === "started") {
        // no-op
      }

      // WIP
      // doesn't get emitted yet, but will in the future
      // the "collected" event is emitted with the partially complete prediction as it streams down
      if (e.type === "collected") {
        console.log("SET PREDICTION", e.payload);
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
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <div>{prediction}</div>
      <div className="btn btn-success w-fit" onClick={doPredictionPromiseBased}>
        Predict
      </div>
      <div className="btn btn-success w-fit" onClick={doPredictionEventDriven}>
        Predict Streaming
      </div>
    </div>
  );
}

export default App;
