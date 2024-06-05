// src/components/IntroPopup.jsx
import React, { useState } from 'react';
import { Button, Dialog, DialogContent, DialogTitle, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '.MuiDialog-paper': {
    position: 'fixed',
    top: theme.spacing(2),
    left: '50%',
    transform: 'translateX(-50%)',
    width: '80%',
    maxWidth: '600px',
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: '8px',
  },
}));

const IntroPopup = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const handleClose = () => {
    setOpen(false);
  };

  const handleCreateAccount = () => {
    handleClose();
    navigate('/signup');
  };

  return (
    <StyledDialog open={open} onClose={handleClose}>
      <DialogTitle>Welcome!</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          Our site is currently under development. To be put on our waitlist and receive reminders, please create an account.
        </Typography>
        <Button variant="contained" color="primary" onClick={handleCreateAccount} style={{ marginTop: '10px' }}>
          Create Account
        </Button>
        <Button variant="contained" color="secondary" onClick={handleClose} style={{ marginTop: '10px', marginLeft: '10px' }}>
          Maybe Later
        </Button>
      </DialogContent>
    </StyledDialog>
  );
};

export default IntroPopup;
