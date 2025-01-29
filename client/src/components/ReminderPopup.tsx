// src/components/ReminderPopup.jsx
import { useState } from 'react';
import { Button, Dialog, DialogContent, DialogTitle, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '.MuiDialog-paper': {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    margin: 0,
    width: '300px',
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: '8px',
  },
}));

const ReminderPopup = () => {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <StyledDialog open={open} onClose={handleClose}>
      <DialogTitle>Did You Know?</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          Hover your mouse over terms to see their explanations. You can also click the Help button and then click on any term for further explanation.
        </Typography>
        <Button variant="contained" color="primary" onClick={handleClose} style={{ marginTop: '10px' }}>
          Got it!
        </Button>
      </DialogContent>
    </StyledDialog>
  );
};

export default ReminderPopup;
