// src/components/Glossary/components/GlossaryTermCard.jsx
import React from 'react';
import { Card } from 'react-bootstrap';

const GlossaryTermCard = ({ term, definition, handleTermClick }) => (
  <Card className="glossary-term-card" onClick={() => handleTermClick(term)}>
    <Card.Body>
      <Card.Title>{term}</Card.Title>
      <Card.Text>{definition}</Card.Text>
    </Card.Body>
  </Card>
);

export default GlossaryTermCard;
