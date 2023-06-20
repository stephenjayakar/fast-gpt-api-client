import React, { useState } from "react";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: "",
});
const openai = new OpenAIApi(configuration);

const completion = async (prompt: string) => {
  const chat_completion = await openai.createChatCompletion({
    model: "gpt-4-32k",
    messages: [{ role: "user", content: prompt }],
  });
  return chat_completion;
};

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const buttonPressed = async () => {
    if (prompt) {
      const res = await completion(prompt);
      const content = res.data.choices.map((c) => c.message!.content);
      const messageText = content.join("\n");
      setResponse(messageText);
      console.log(messageText);
    }
  };
  return (
    <div className="App">
      <input type="text" onChange={(e) => setPrompt(e.target.value)} />
      <button onClick={buttonPressed}>Send</button>
      <p>{response}</p>
    </div>
  );
}

export default App;
