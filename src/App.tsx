import React, { useState, useEffect } from "react";
import { Configuration, OpenAIApi } from "openai";
import { createSimpleCompletion } from "./openaiWrapper";

const createConfig = (apiKey: string) =>
  new Configuration({
    apiKey,
  });

function App() {
  const [apiKey, setApiKey] = useState("");
  const [openAIClient, setOpenAIClient] = useState<OpenAIApi | null>(null);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [sendPreviousResponses, setSendPreviousResponses] = useState(false);

  const authenticated = openAIClient !== null;

  useEffect(() => {
    const storedApiKey = localStorage.getItem("API_KEY");
    if (storedApiKey) {
      const configuration = createConfig(storedApiKey);
      setOpenAIClient(new OpenAIApi(configuration));
    }
  }, []);

  const saveApiKeyAndSetupConfig = () => {
    localStorage.setItem("API_KEY", apiKey);
    const configuration = createConfig(apiKey);
    setOpenAIClient(new OpenAIApi(configuration));
  };

  const buttonPressed = async () => {
    if (prompt && openAIClient) {
      let fullPrompt = prompt;
      if (sendPreviousResponses) {
        fullPrompt = response + "\n" + fullPrompt;
      }
      const messageText = await createSimpleCompletion(
        openAIClient,
        fullPrompt
      );
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
