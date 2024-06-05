// src/components/HelpButton.jsx
import React, { useState } from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import InfoPopup from './InfoPopup';
import CommonQuestions from './CommonQuestions';

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
