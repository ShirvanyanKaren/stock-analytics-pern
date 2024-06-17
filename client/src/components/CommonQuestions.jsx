// src/components/CommonQuestions.jsx
import React from 'react';
import { Card, CardContent, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { commonQuestions } from '../utils/helpers';




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

export default CommonQuestions;
