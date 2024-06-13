// src/contexts/HighlightContext.jsx
import React, { createContext, useState, useContext } from 'react';

const HighlightContext = createContext();

export const useHighlight = () => {
  return useContext(HighlightContext);
};

export const HighlightProvider = ({ children }) => {
  const [highlightedElements, setHighlightedElements] = useState([]);
  const [helpMode, setHelpMode] = useState(false);

  const addHighlight = (id) => {
    setHighlightedElements((prev) => [...prev, id]);
  };

  const removeHighlight = (id) => {
    setHighlightedElements((prev) => prev.filter((el) => el !== id));
  };

  const toggleHelpMode = () => {
    setHelpMode(!helpMode);
  };

  return (
    <HighlightContext.Provider value={{ highlightedElements, addHighlight, removeHighlight, helpMode, toggleHelpMode }}>
      {children}
    </HighlightContext.Provider>
  );
};
