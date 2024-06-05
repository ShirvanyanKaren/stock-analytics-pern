// src/components/CommonQuestions.jsx
import React from 'react';
import { Card, CardContent, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const commonQuestions = [
  {
    question: "What is this page about?",
    answer: "This page provides detailed financial information about the selected stock, including historical data, financial statements, and analytics."
  },
  {
    question: "How can I view financial statements?",
    answer: "You can click on the 'Financials' tab to view the income statement, balance sheet, and cash flow statement of the selected stock."
  },
  {
    question: "What is the significance of the charts?",
    answer: "The charts show historical price and volume data, which can help you understand the stock's performance over time."
  },
  {
    question: "How do I use the Knowledge Mode?",
    answer: "In Knowledge Mode, you can click on financial terms to get detailed explanations and definitions."
  }
  // Add more questions as needed
];

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
