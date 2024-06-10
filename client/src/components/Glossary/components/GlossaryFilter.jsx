// src/components/Glossary/components/GlossaryFilter.jsx
import React from 'react';
import { Button } from 'react-bootstrap';

const GlossaryFilter = ({ selectedLetter, handleLetterClick, handleAllClick }) => (
  <div className="glossary-filter-container">
    <div className="glossary-filter">
      <Button
        className={`filter-button ${selectedLetter === '' ? 'active' : ''}`}
        onClick={handleAllClick}
      >
        All
      </Button>
      {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
        <Button
          key={letter}
          className={`filter-button ${selectedLetter === letter ? 'active' : ''}`}
          onClick={() => handleLetterClick(letter)}
          style={{ color: 'black' }}
        >
          {letter}
        </Button>
      ))}
    </div>
  </div>
);

export default GlossaryFilter;
