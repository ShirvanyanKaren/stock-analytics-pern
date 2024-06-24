// src/components/HelpButton.jsx
import { useState } from 'react';
import { Card, CardContent, Typography, IconButton } from '@mui/material';
import { commonQuestions } from '../utils/helpers';
import { Button, Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import InfoPopup from './InfoPopup';
import CloseIcon from '@mui/icons-material/Close';

const StyledButton = styled(Button)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  backgroundColor: '#1e3a8a',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#1c2e5e',
  },
}));

const HelpButton = ({ toggleHelpMode }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [showCommonQuestions, setShowCommonQuestions] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleKnowledgeMode = () => {
    setShowInfoPopup(true);
    toggleHelpMode();
    handleCloseMenu();
  };

  const handleCommonQuestions = () => {
    setShowCommonQuestions(true);
    handleCloseMenu();
  };

  const handleClosePopup = () => {
    setShowInfoPopup(false);
  };

  const handleCloseCommonQuestions = () => {
    setShowCommonQuestions(false);
  };



const CommonQuestions = ({ handleClose }) => {
  return (
    <Card style={{ maxHeight: '80vh', overflow: 'auto', position: 'fixed', bottom: '20px', right: '20px', width: '300px', backgroundColor: '#333', color: '#fff' }}>
      <CardContent>
        <Typography variant="h6" style={{ marginBottom: '10px' }}>
          Common Questions
          <IconButton onClick={handleClose} style={{ float: 'right', color: '#fff' }}>
            <CloseIcon />
          </IconButton>
        </Typography>
        {commonQuestions.map((item, index) => (
          <div key={index} style={{ marginBottom: '15px' }}>
            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
              {item.question}
            </Typography>
            <Typography variant="body2">
              {item.answer}
            </Typography>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

  return (
    <>
      <StyledButton variant="contained" onClick={handleClick}>
        Help
      </StyledButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={handleKnowledgeMode}>Knowledge Mode</MenuItem>
        <MenuItem onClick={handleCommonQuestions}>Common Questions</MenuItem>
      </Menu>
      <InfoPopup open={showInfoPopup} handleClose={handleClosePopup} info="Welcome to Knowledge Mode. Click on any term to learn more." />
      {showCommonQuestions && <CommonQuestions handleClose={handleCloseCommonQuestions} />}
    </>
  );
};

export default HelpButton;
