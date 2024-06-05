// src/components/InfoPopup.jsx
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Button, IconButton, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import { standardizeTerm } from '../utils/termFormatter';
import { useHighlight } from '../contexts/HighlightContext';

const API_KEY = "your_openai_api_key"; // Replace with your OpenAI API key

const InfoPopup = ({ open, handleClose, info }) => {
  const [isChatbot, setIsChatbot] = useState(false);
  const [showDefinition, setShowDefinition] = useState(false);
  const navigate = useNavigate();
  const { helpMode } = useHighlight();
  const glossaryData = {}; // Replace this with actual glossary data fetching logic

  const handleNavigate = () => {
    handleClose();
    navigate(`/glossary/${encodeURIComponent(standardizeTerm(info))}`); // Use standardized term
  };

  const handleChat = () => {
    setIsChatbot(true);
  };

  const handleBack = () => {
    setIsChatbot(false);
  };

  const handleReadMore = () => {
    setShowDefinition(true);
  };

  const handleGoBack = () => {
    setShowDefinition(false);
  };

  const definition = glossaryData[standardizeTerm(info)] || 'Definition not found.';

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        {isChatbot ? (
          <IconButton onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
        ) : showDefinition ? (
          <IconButton onClick={handleGoBack}>
            <ArrowBackIcon />
          </IconButton>
        ) : (
          <>
            Information
            <IconButton onClick={handleClose} style={{ float: 'right' }}>
              <CloseIcon />
            </IconButton>
          </>
        )}
      </DialogTitle>
      <DialogContent>
        {isChatbot ? (
          <Chatbot initialMessage={info} />
        ) : showDefinition ? (
          <Card>
            <CardContent>
              <Typography variant="h6">{info}</Typography>
              <Typography variant="body1">{definition}</Typography>
              <Button variant="contained" color="primary" onClick={handleNavigate} style={{ marginTop: '10px' }}>
                Learn More
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Typography variant="body1" className={helpMode ? 'highlight' : ''}>{info}</Typography>
            <Button variant="contained" color="primary" onClick={handleReadMore} style={{ marginTop: '10px' }}>
              Read More
            </Button>
            <Button variant="contained" color="secondary" onClick={handleChat} style={{ marginTop: '10px', marginLeft: '10px' }}>
              Ask Chatbot
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

const Chatbot = ({ initialMessage }) => {
  const [messages, setMessages] = useState([{ message: initialMessage, sender: "system", direction: "incoming" }]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');

  const handleSend = async (message) => {
    const newMessage = { message, sender: "User", direction: "outgoing" };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setTyping(true);

    await processMessageToChatGPT(newMessages, message);
  };

  const processMessageToChatGPT = async (chatMessages, userMessage) => {
    const apiMessages = chatMessages.map((msg) => {
      let role = msg.sender === "ChatGPT" ? "assistant" : "user";
      return { role, content: msg.message };
    });

    const systemMessage = {
      role: "system",
      content: "You are a helpful assistant providing easy-to-understand definitions of financial terms."
    };

    const apiRequestBody = {
      model: "gpt-4",
      messages: [systemMessage, ...apiMessages, { role: "user", content: userMessage }]
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    });

    const data = await response.json();
    const botMessage = { message: data.choices[0].message.content, sender: "ChatGPT", direction: "incoming" };
    setMessages([...chatMessages, botMessage]);
    setTyping(false);
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

export default InfoPopup;
