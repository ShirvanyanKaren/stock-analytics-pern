// src/components/Tutorials/SearchBar.jsx

import React from 'react';
import { Form, Button } from 'react-bootstrap';

const SearchBar = ({ searchTerm, handleSearch }) => {
  return (
    <Form className="d-flex">
      <Form.Control
        type="search"
        placeholder="Search tutorials"
        className="me-2"
        aria-label="Search"
        value={searchTerm}
        onChange={handleSearch}
      />
      <Button variant="outline-success">Search</Button>
    </Form>
  );
};

export default SearchBar;
