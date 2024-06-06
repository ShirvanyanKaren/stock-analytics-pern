import React, { useState, useEffect } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import axios from 'axios';

const pyBackEnd = "http://127.0.0.1:8000";  // Update this to your local backend URL

const Chatbot = ({ initialMessage, definition }) => {
  const [messages, setMessages] = useState([
    { message: `Term: ${initialMessage}\nDefinition: ${definition}`, sender: "system", direction: "incoming" }
  ]);
  const [typing, setTyping] = useState(false);
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await axios.get(`${pyBackEnd}/apikey`);
        setApiKey(response.data.api_key);
      } catch (error) {
        console.error("Error fetching API key:", error);
      }
    };

    fetchApiKey();
  }, []);

  const handleSend = async (message) => {
    const newMessage = { message, sender: "User", direction: "outgoing" };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setTyping(true);

    await processMessageToChatGPT(newMessages, message);
  };

  const processMessageToChatGPT = async (chatMessages, userMessage) => {
    if (!apiKey) {
      console.error("API key is not available.");
      setTyping(false);
      return;
    }

    const apiMessages = chatMessages.map((msg) => {
      return { role: msg.sender === "ChatGPT" ? "assistant" : "user", content: msg.message };
    });

    const systemMessage = {
      role: "system",
      content: "You are a helpful assistant providing easy-to-understand definitions of financial terms."
    };

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...apiMessages, { role: "user", content: userMessage }]
    };

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const data = await response.json();
      const botMessage = { message: data.choices[0].message.content, sender: "ChatGPT", direction: "incoming" };
      setMessages([...chatMessages, botMessage]);
      setTyping(false);
    } catch (error) {
      console.error("Error communicating with OpenAI API:", error);
      setTyping(false);
    }
  };

  return (
    <MainContainer>
      <ChatContainer>
        <MessageList typingIndicator={typing ? <TypingIndicator content="ChatGPT is typing..." /> : null}>
          {messages.map((msg, i) => (
            <Message key={i} model={msg} />
          ))}
        </MessageList>
        <MessageInput
          placeholder="Type Message Here"
          onSend={(msg) => handleSend(msg)}
          attachButton={false}
        />
      </ChatContainer>
    </MainContainer>
  );
};

export default Chatbot;
