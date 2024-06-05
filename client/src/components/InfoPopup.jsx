import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Button, IconButton, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { standardizeTerm } from '../utils/termFormatter';
import { useHighlight } from '../contexts/HighlightContext';
import Chatbot from './Chatbot';

const InfoPopup = ({ open, handleClose, info }) => {
  const [isChatbot, setIsChatbot] = useState(false);
  const [showDefinition, setShowDefinition] = useState(false);
  const [glossaryData, setGlossaryData] = useState({});
  const [apiKey, setApiKey] = useState("");
  const navigate = useNavigate();
  const { helpMode } = useHighlight();

  useEffect(() => {
    fetch('/glossary.json')
      .then(response => response.json())
      .then(data => setGlossaryData(data))
      .catch(error => console.error("Failed to fetch glossary data:", error));

    fetch('/apikey')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch API key');
        }
        return response.json();
      })
      .then(data => setApiKey(data.api_key))
      .catch(error => console.error("Failed to fetch API key:", error));
  }, []);

  const handleNavigate = () => {
    const standardizedTerm = standardizeTerm(info);
    handleClose();
    navigate(`/glossary/${encodeURIComponent(standardizedTerm)}`);
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

  const standardizedTerm = standardizeTerm(info);
  const matchedTerm = Object.keys(glossaryData).find(key => standardizeTerm(key) === standardizedTerm);
  const definition = matchedTerm ? glossaryData[matchedTerm] : 'Definition not found.';

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
          <Chatbot initialMessage={info} definition={definition} apiKey={apiKey} />
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

export default InfoPopup;
