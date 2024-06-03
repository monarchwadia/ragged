import { Chat } from "ragged/chat";

const c = Chat.with("openai", {
    apiKey: "sk-whatever"
})

console.log(c);

// let history: Message[] = [];
// c.chat(history)