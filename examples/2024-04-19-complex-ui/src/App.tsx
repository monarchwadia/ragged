import { Ragged, RaggedTool } from "ragged";
import { useState } from "react";

type Room = {
  name: string;
  brightness: number;
};

function App() {
  const [rooms, setRooms] = useState([
    { name: "Living room", brightness: 0.5 },
    { name: "Kitchen", brightness: 0.7 },
    { name: "Bedroom", brightness: 0.3 },
  ] as Room[]);

  // this history hook should be exposed by ragged, so that it doesn't need to be built over and over again.
  const [history, setHistory] = useState([] as string[]);
  const [prompt, setPrompt] = useState("Set lights to 50% in all rooms");

  console.log("CREDS", import.meta.env.VITE_OPENAI_CREDS);

  const processCommand = () => {
    const r = new Ragged({
      openai: {
        // might be better to just wrap the openai client itself. that way, things are much more clear.
        // const openai = new OpenAI({apiKey, dangersoulyAllowBrowser: true});
        // const r = new Ragged(openai);
        apiKey: import.meta.env.VITE_OPENAI_CREDS,
        dangerouslyAllowBrowser: true,
      },
    });

    // I really like the feeling of the builder pattern. Right now though, all the package-private methods are publicly exposed.
    // There is no way to enforce package-private scope in Typescript, so we'll have to find a way to do clean up the interface in another way.
    // Tool also needs a `validator` method, which can be used to validate the input and output of the tool.
    // Tool also needs separate event handlers for "on tool call initialized" and "on tool call received", and these should be in the tool itself
    const tool = new RaggedTool()
      .title("set-lights")
      .description(
        "This tool controls the lighting in various rooms by adjusting brightness levels. Users can specify the brightness for each room using a percentage scale (0-100%), where the payload is an array of objects. Each object represents a room, containing 'name' (string) and 'brightness' (number) properties. The 'brightness' property is denoted in floating point numbers between 0 and 1, where 0 corresponds to 0%, 0.5 corresponds to 50%, 1 corresponds to 100%, and so on."
      )
      .example({
        description:
          "When the user says 'set brightness to 50% in all rooms', it returns an array of rooms with the brightness set to 0.5.",
        input: `[{ "name": "Living room", "brightness": 1.0 }, { "name": "Kitchen", "brightness": 1.0 }, { "name": "Bedroom", "brightness": 1.0 }]`,
        output: `[{ "name": "Living room", "brightness": 0.5 }, { "name": "Kitchen", "brightness": 0.5 }, { "name": "Bedroom", "brightness": 0.5 }]`,
      })
      .example({
        description:
          "When the user says 'set brightness to 0%', it assumes the user is talking about all rooms. It returns an array of rooms with the brightness set to 0.",
        input:
          '[{ "name": "Living room", "brightness": 0.5 }, { "name": "Kitchen", "brightness": 0.7 }, { "name": "Bedroom", "brightness": 1.0 }]',
        output:
          '[{ "name": "Living room", "brightness": 0 }, { "name": "Kitchen", "brightness": 0 }, { "name": "Bedroom", "brightness": 0 }]',
      })
      .handler((payload) => {
        setRooms(payload);
        // setRooms(payload);
      });

    const stream = r.predictStream(
      `
    User: ${prompt}
    
    Input: ${JSON.stringify(rooms)}
  `,
      {
        // note that gpt-4-turbo is best for function calling.. but it throws an error because it's not specified in ragged
        // need to add the ability to specify the model without throwing a typescript error
        model: "gpt-4-turbo",
        tools: [tool],
      }
    );

    stream.subscribe((response) => {
      // Here are the current options: "started" | "chunk" | "collected" | "finished" | "tool_use_start" | "tool_use_finish"
      // none of these are really useful names for the user. instead, the emitted event type names needs to be more user friendly.
      // for example,
      // "started" could be "predict.start"
      // "chunk" could be "text.chunk"
      // "collected" could be "text"
      // "tool_use_start" could be "tool.init"
      // "tool_use_finish" could be "tool"
      // "finished" could be "predict.end"
      if (response.type === "collected") {
        setHistory((prev) => {
          const newHistory = [...prev];
          newHistory.pop();
          newHistory.push(response.payload);
          return newHistory;
        });
      }

      // if (response.type === "tool_use_finish") {
      //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
      //   setRooms(response.payload as any);
      // }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl">Interactive UI example</h1>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button onClick={() => processCommand()}>Send</button>
      <h2 className="text-lg font-bold">Rooms</h2>
      {JSON.stringify(rooms)}
      <h2 className="text-lg font-bold">History</h2>
      {JSON.stringify(history)}
    </div>
  );
}

export default App;
