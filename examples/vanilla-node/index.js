// const Ragged = require('ragged');
import { Ragged } from "ragged";
import dotenv from "dotenv";
dotenv.config();

const r = new Ragged({
    openai: {
        apiKey: process.env.OPENAI_API_KEY
    }
});
r.qPredict("What is Toronto?")
    .then(console.log)
    .catch(console.error)

// const r = new Ragged();