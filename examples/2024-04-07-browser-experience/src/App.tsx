import { Ragged, t } from "ragged";
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
      provider: "openai",
      config: {
        apiKey: import.meta.env.VITE_OPENAI_CREDS,
        dangerouslyAllowBrowser: true,
      },
    });

    // I really like the feeling of the builder pattern. Right now though, all the package-private methods are publicly exposed.
    // There is no way to enforce package-private scope in Typescript, so we'll have to find a way to do clean up the interface in another way.
    // Tool also needs a `validator` method, which can be used to validate the input and output of the tool.
    // Tool also needs separate event handlers for "on tool call initialized" and "on tool call received", and these should be in the tool itself
    const tool = t
      .tool()
      .title("set-lights")
      .description(
        "This tool controls the lighting in various rooms by adjusting brightness levels. Users can specify the brightness for each room using a percentage scale (0-100%), where the payload is an array of objects. Each object represents a room, containing 'name' (string) and 'brightness' (number) properties. The 'brightness' property is denoted in floating point numbers between 0 and 1, where 0 corresponds to 0%, 0.5 corresponds to 50%, 1 corresponds to 100%, and so on."
      )
      .inputs({
        roomName: t
          .string()
          .description("The name of the room to set the brightness for."),
        brightness: t
          .number()
          .description("The brightness level to set the room to."),
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .handler((payload: any) => {
        // This handler will be called multiple times, once for each room. This needs to be documented
        // somewhere to avoid confusion.
        setRooms((rooms) => {
          return rooms.map((room) => {
            if (room.name === payload.roomName) {
              return { ...room, brightness: payload.brightness };
            }
            return room;
          });
        });
      });

    const stream = r.chatStream(
      `
    User: ${prompt}
    
    Input: ${JSON.stringify(rooms)}
  `,
      {
        tools: [tool],
        requestOverrides: {
          model: "gpt-4-turbo",
        },
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stream.subscribe((response: any) => {
      if (response.type === "text.joined") {
        setHistory((prev) => {
          const newHistory = [...prev];
          newHistory.pop();
          newHistory.push(response.payload);
          return newHistory;
        });
      }
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
