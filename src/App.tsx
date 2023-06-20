import React, { useState, useEffect } from "react";
import { Configuration, OpenAIApi } from "openai";

const createConfig = (apiKey: string) =>
  new Configuration({
    apiKey,
  });

function App() {
  const [apiKey, setApiKey] = useState("");
  const [configuration, setConfiguration] = useState<Configuration | null>(
    null
  );
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("API_KEY");
    if (storedApiKey) {
      setConfiguration(createConfig(storedApiKey));
      setAuthenticated(true);
    }
  }, []);

  const saveApiKeyAndSetupConfig = () => {
    localStorage.setItem("API_KEY", apiKey);
    setConfiguration(createConfig(apiKey));
    setAuthenticated(true);
  };

  const openai = configuration ? new OpenAIApi(configuration) : null;

  const completion = async (prompt: string) => {
    if (!openai) return null;
    const chat_completion = await openai.createChatCompletion({
      model: "gpt-4-32k",
      messages: [{ role: "user", content: prompt }],
    });
    return chat_completion;
  };

  const buttonPressed = async () => {
    if (prompt && openai) {
      const res = await completion(prompt);
      const content = res!.data.choices.map((c) => c.message!.content);
      const messageText = content.join("\n");
      setResponse(messageText);
      console.log(messageText);
    }
  };

  return (
    <div className="App">
      {!authenticated && (
        <>
          <input
            type="password"
            placeholder="API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <button onClick={saveApiKeyAndSetupConfig}>Save API Key</button>
        </>
      )}
      {authenticated && (
        <>
          <p>Authenticated!</p>
          <input type="text" onChange={(e) => setPrompt(e.target.value)} />
          <button onClick={buttonPressed}>Send</button>
          <p>{response}</p>
        </>
      )}
    </div>
  );
}

export default App;
