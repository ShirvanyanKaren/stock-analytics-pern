// src/components/Tutorials/CategoryDropdown.jsx

import React from 'react';
import { Dropdown } from 'react-bootstrap';

const CategoryDropdown = ({ handleCategorySelect }) => {
  return (
    <Dropdown>
      <Dropdown.Toggle variant="primary" id="dropdown-categories">
        Categories
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => handleCategorySelect("")}>All</Dropdown.Item>
        <Dropdown.Item onClick={() => handleCategorySelect("Stocks")}>Stocks</Dropdown.Item>
        <Dropdown.Item onClick={() => handleCategorySelect("Options")}>Options</Dropdown.Item>
        <Dropdown.Item onClick={() => handleCategorySelect("Bonds")}>Bonds</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default CategoryDropdown;
