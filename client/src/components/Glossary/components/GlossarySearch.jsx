// src/components/Glossary/components/GlossarySearch.jsx
import React from 'react';
import { Form } from 'react-bootstrap';

const GlossarySearch = ({ searchTerm, handleSearch }) => (
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
);

export default GlossarySearch;
