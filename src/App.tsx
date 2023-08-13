import React, { useState, useEffect } from "react";
import { Configuration, OpenAIApi } from "openai";
import ReactMarkdown from "react-markdown";

const createConfig = (apiKey: string) =>
  new Configuration({
    apiKey,
  });

interface Message {
  sender: Sender;
  contents: string;
}

enum Sender {
  Me = "Me",
  ChatGPT = "ChatGPT",
}

const globalStyles = {
  fontFamily: "Arial",
  fontSize: 18,
  maxWidth: 500,
  minWidth: 500,
};

function App() {
  const [apiKey, setApiKey] = useState("");
  const [openAIClient, setOpenAIClient] = useState<OpenAIApi | null>(null);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  // const [response, setResponse] = useState("");
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

  // const openAIClient = configuration ? new OpenAIApi(configuration) : null;

  const completion = async (fullPrompt: string) => {
    if (!openAIClient) return null;
    const chat_completion = await openAIClient.createChatCompletion({
      model: "gpt-4-32k",
      messages: [{ role: "user", content: fullPrompt }],
    });
    return chat_completion;
  };

  const buttonPressed = async () => {
    if (prompt && openAIClient) {
      // TODO: reimpl this
      // let fullPrompt = prompt;
      // if (sendPreviousResponses) {
      //   fullPrompt = response + "\n" + fullPrompt;
      // }

      const res = await completion(prompt);
      const content = res!.data.choices
        .map((c) => c.message!.content)
        .join("\n");
      setMessages([
        ...messages,
        { sender: Sender.Me, contents: prompt },
        { sender: Sender.ChatGPT, contents: content },
      ]);
      // const messageText =
      //   (response ? response + "\n" : "") + content.join("\n");
      // setResponse(messageText);
    }
  };

  console.log(messages);
  return (
    <div style={globalStyles}>
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
          <div>
            {messages.map((m) => {
              return (
                <div
                  style={{
                    backgroundColor:
                      m.sender == Sender.ChatGPT ? "white" : "lightgrey",
                  }}
                >
                  <span>
                    {m.sender}: <ReactMarkdown>{m.contents}</ReactMarkdown>
                  </span>
                </div>
              );
            })}
          </div>
          <input type="text" onChange={(e) => setPrompt(e.target.value)} />
          <button onClick={buttonPressed}>Send</button>
        </>
      )}
    </div>
  );
}

export default App;
