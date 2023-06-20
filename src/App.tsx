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
  const [sendPreviousResponses, setSendPreviousResponses] = useState(false);

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

  const completion = async (fullPrompt: string) => {
    if (!openai) return null;
    const chat_completion = await openai.createChatCompletion({
      model: "gpt-4-32k",
      messages: [{ role: "user", content: fullPrompt }],
    });
    return chat_completion;
  };

  const buttonPressed = async () => {
    if (prompt && openai) {
      let fullPrompt = prompt;
      if (sendPreviousResponses) {
        fullPrompt = response + "\n" + fullPrompt;
      }
      const res = await completion(prompt);
      const content = res!.data.choices.map((c) => c.message!.content);
      const messageText =
        (response ? response + "\n" : "") + content.join("\n");
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
          <p>✅ Authenticated!</p>
          <span>
            <p>Send previous responses?</p>
            <input
              type="checkbox"
              onChange={(e) => setSendPreviousResponses(e.target.checked)}
            />
          </span>
          <p>{response}</p>
          <input type="text" onChange={(e) => setPrompt(e.target.value)} />
          <button onClick={buttonPressed}>Send</button>
        </>
      )}
    </div>
  );
}

export default App;
