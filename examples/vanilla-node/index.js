// const Ragged = require('ragged');
import { Ragged } from "ragged";
import dotenv from "dotenv";
dotenv.config();

const r = new Ragged({
    provider: "openai",
    config: {
        apiKey: process.env.OPENAI_API_KEY,
    }
});

r.chat("What is Toronto?")
    .first("finished")
    .then(x => console.log(x.data))
    .catch(console.error)

