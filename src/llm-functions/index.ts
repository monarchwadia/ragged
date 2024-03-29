import { OpenAI } from "openai";
const { VITE_OPENAI_CREDS } = import.meta.env;

const fetchOpenAICompletion = async (prompt: string) => {
  const o = new OpenAI({
    apiKey: VITE_OPENAI_CREDS,
    dangerouslyAllowBrowser: true,
  });

  const response = await o.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const answer = response.choices[0].message.content;

  return answer;
};

export const quickPredict = async (text: string) => {
  return fetchOpenAICompletion(text);
};
