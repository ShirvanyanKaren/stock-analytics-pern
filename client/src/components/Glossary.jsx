import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { standardizeTerm } from '../utils/termFormatter';
import './Glossary.css';

const Glossary = () => {
  const { term } = useParams();
  const navigate = useNavigate();
  const [terms, setTerms] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTerms, setFilteredTerms] = useState({});
  const [selectedLetter, setSelectedLetter] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  useEffect(() => {
    fetch('/glossary.json')
      .then(response => response.json())
      .then(data => setTerms(data))
      .catch(error => console.error("Failed to fetch glossary data:", error));
  }, []);

  useEffect(() => {
    if (term) {
      const standardizedTerm = standardizeTerm(decodeURIComponent(term));
      const matchedTerm = Object.keys(terms).find(key => standardizeTerm(key) === standardizedTerm);
      if (matchedTerm) {
        setSelectedTerm({ term: matchedTerm, definition: terms[matchedTerm] });
      } else {
        setSelectedTerm({ term: term, definition: 'Definition not found.' });
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

  const handleAllClick = () => {
    setSelectedLetter('');
    setSearchTerm('');
  };

  const handleTermClick = (term) => {
    navigate(`/glossary/${encodeURIComponent(term)}`);
  };

  return (
    <Container>
      <Row className="mt-3">
        <Col>
          <Card className="glossary-card">
            <Card.Body>
              <div className="glossary-header-container">
                <h1>Glossary</h1>
              </div>
              <div className="glossary-search-container">
                <Form className="d-flex">
                  <Form.Control
                    type="search"
                    placeholder="Search terms"
                    className="me-2"
                    aria-label="Search"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </Form>
              </div>
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
                      style={{ color: 'black' }} // Change font color to black
                    >
                      {letter}
                    </Button>
                  ))}
                </div>
              </div>
              {selectedTerm ? (
                <Card className="mb-3">
                  <Card.Body>
                    <Card.Title>{selectedTerm.term}</Card.Title>
                    <Card.Text>{selectedTerm.definition}</Card.Text>
                    <Button onClick={() => navigate('/glossary')}>Back to Glossary</Button>
                  </Card.Body>
                </Card>
              ) : (
                <Row>
                  {Object.keys(filteredTerms).map((term, index) => (
                    <Col key={index} md={4} className="mb-3">
                      <Card className="glossary-term-card" onClick={() => handleTermClick(term)}>
                        <Card.Body>
                          <Card.Title>{term}</Card.Title>
                          <Card.Text>{filteredTerms[term]}</Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Glossary;
