// src/components/HelpButton.jsx
import React, { useState } from 'react';
import { Button, Modal, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useHighlight } from '/src/contexts/HighlightContext'; // Correctly import useHighlight

const HelpButton = ({ toggleHelpMode }) => {
  const [open, setOpen] = useState(false);
  const { helpMode, addHighlight, removeHighlight } = useHighlight(); // Correctly use useHighlight

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleHelpClick = () => {
    toggleHelpMode();
    handleClose();
  };

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

  return (
    <>
      <StyledButton variant="contained" onClick={handleOpen}>
        Help
      </StyledButton>
      <Modal open={open} onClose={handleClose}>
        <div style={{ padding: '20px', background: '#333', color: '#fff', margin: '10% auto', maxWidth: '500px', borderRadius: '8px' }}>
          <Typography variant="h6">Help Mode</Typography>
          <Typography variant="body2">Click the help button to highlight elements you can get more information about.</Typography>
          <Button variant="contained" color="primary" onClick={handleHelpClick} style={{ marginTop: '10px' }}>
            Activate Help Mode
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default HelpButton;
