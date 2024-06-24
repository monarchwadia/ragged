import { Chat } from "ragged";
import { Embed } from "ragged";

console.log(Chat.with("openai", { apiKey: "nope" }));
console.log(Embed.with("openai", { apiKey: "nope" }));
