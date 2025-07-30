import { Chat } from "ragged";
import { Embed } from "ragged";

console.log(Chat.with({
    provider: "openai",
    config: { apiKey: "nope" }
}))
console.log(Embed.with({
    provider: "openai",
    config: {
        apiKey: "nope"
    }
}));
