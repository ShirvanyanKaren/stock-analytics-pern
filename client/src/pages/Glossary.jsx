import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { returnInfo } from '../utils/helpers';
import { useLocation } from 'react-router-dom';
import { Modal } from 'react-bootstrap';

const Glossary = () => {
  const { term } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTerms, setFilteredTerms] = useState({});
  const [selectedLetter, setSelectedLetter] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const location = useLocation();

  useEffect(() => {
    if (term && returnInfo[term]) {
      const searchTerm = decodeURIComponent(term);
      setSelectedTerm({ term: searchTerm, definition: returnInfo[searchTerm] });
    } else {
      setSelectedTerm('');
    }
  }, [location, term]);

  useEffect(() => {
    let newFilteredTerms = returnInfo;
    if (selectedLetter) {
      newFilteredTerms = Object.keys(returnInfo)
        .filter(term => term.toLowerCase().startsWith(selectedLetter.toLowerCase()))
        .reduce((obj, key) => {
          obj[key] = returnInfo[key];
          return obj;
        }, {});
    }
    if (searchTerm) {
      newFilteredTerms = Object.keys(newFilteredTerms)
        .filter(term => term.toLowerCase().includes(searchTerm.toLowerCase()))
        .reduce((obj, key) => {
          obj[key] = returnInfo[key];
          return obj;
        }, {});
    }

    setFilteredTerms(newFilteredTerms);
  }, [searchTerm, selectedLetter]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'searchTerm') {
      setSearchTerm(value);
    } else if (name === 'selectedLetter') {
      setSelectedLetter(value === selectedLetter ? '' : value);
    }
  };

  const handleTermClick = (term) => {
    navigate(`/glossary/${encodeURIComponent(term)}`);
  };

  return (
    <div className="glossary-wrapper container bg-light card mt-2">
      <div className="glossary-container">
        {selectedTerm && (
          <Modal show={true} onHide={() => navigate('/glossary')}>
            <Modal.Header closeButton>
              <Modal.Title>{selectedTerm.term}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>{selectedTerm.definition}</p>
            </Modal.Body>
          </Modal>
        )}
        <form onSubmit={(e) => e.preventDefault()} className="glossary-header d-flex w-100 justify-content-center">
          <input
            type="text"
            name="searchTerm"
            placeholder="Search terms..."
            value={searchTerm}
            onChange={handleInputChange}
          />
        </form>
        <div className="glossary-filter">
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
            <button
              key={letter}
              className={`filter-button ${selectedLetter === letter ? 'active' : ''}`}
              name="selectedLetter"
              value={letter}
              onClick={handleInputChange}
            >
              {letter}
            </button>
          ))}
        </div>
        <div className="glossary-terms">
          {Object.keys(filteredTerms).length ? (Object.keys(filteredTerms).map((term, index) => (
            <div key={index} className="glossary-term-card" onClick={() => handleTermClick(term)}>
              <h3>{term}</h3>
              <p>{filteredTerms[term]}</p>
            </div>
          )) ) : (
            <div className="d-flex w-100 justify-content-center mt-4">
              <h3>No terms found</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Glossary;
