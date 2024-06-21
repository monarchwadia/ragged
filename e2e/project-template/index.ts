import { Chat } from "ragged/chat";
import { Embed } from "ragged/embed";

console.log(Chat.with("openai", { apiKey: "nope" }));
console.log(Embed.with("openai", { apiKey: "nope" }));
