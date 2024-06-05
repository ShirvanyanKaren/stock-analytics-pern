// src/components/Glossary.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { standardizeTerm } from '../utils/termFormatter'; // Import the standardizeTerm function
import './Glossary.scss';

const Glossary = () => {
  const { term } = useParams();
  const navigate = useNavigate();
  const [terms, setTerms] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTerms, setFilteredTerms] = useState({});
  const [selectedLetter, setSelectedLetter] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  useEffect(() => {
    fetch('/src/data/glossary.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const standardizedData = {};
        for (const key in data) {
          standardizedData[standardizeTerm(key)] = data[key];
        }
        setTerms(standardizedData);
      })
      .catch(error => {
        console.error("Failed to fetch glossary data:", error);
      });
  }, []);

  useEffect(() => {
    if (term) {
      const standardizedTerm = standardizeTerm(decodeURIComponent(term));
      if (terms[standardizedTerm]) {
        setSelectedTerm({ term: standardizedTerm, definition: terms[standardizedTerm] });
      } else {
        setSelectedTerm({ term: standardizedTerm, definition: 'Definition not found.' });
      }
    } else {
      setSelectedTerm('');
    }
  }, [term, terms]);

  useEffect(() => {
    let newFilteredTerms = terms;

    if (searchTerm) {
      newFilteredTerms = Object.keys(terms)
        .filter(term => term.toLowerCase().includes(searchTerm.toLowerCase()))
        .reduce((obj, key) => {
          obj[key] = terms[key];
          return obj;
        }, {});
    }

    if (selectedLetter) {
      newFilteredTerms = Object.keys(terms)
        .filter(term => term.toLowerCase().startsWith(selectedLetter.toLowerCase()))
        .reduce((obj, key) => {
          obj[key] = terms[key];
          return obj;
        }, {});
    }

    setFilteredTerms(newFilteredTerms);
  }, [searchTerm, selectedLetter, terms]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter);
  };

  const handleTermClick = (term) => {
    navigate(`/glossary/${encodeURIComponent(term)}`);
  };

  return (
    <div className="glossary-container">
      {selectedTerm ? (
        <div className="glossary-term-container">
          <h2>{selectedTerm.term}</h2>
          <p>{selectedTerm.definition}</p>
          <button onClick={() => navigate('/glossary')}>Back to Glossary</button>
        </div>
      ) : (
        <>
          <div className="glossary-header">
            <input
              type="text"
              placeholder="Search terms..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="glossary-filter">
            {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
              <button
                key={letter}
                className={`filter-button ${selectedLetter === letter ? 'active' : ''}`}
                onClick={() => handleLetterClick(letter)}
              >
                {letter}
              </button>
            ))}
          </div>
          <div className="glossary-terms">
            {Object.keys(filteredTerms).map((term, index) => (
              <div key={index} className="glossary-term-card" onClick={() => handleTermClick(term)}>
                <h3>{term}</h3>
                <p>{filteredTerms[term]}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Glossary;
