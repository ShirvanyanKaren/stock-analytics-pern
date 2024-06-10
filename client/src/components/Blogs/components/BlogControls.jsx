import React from 'react';
import { Row, Col, Form, Button, Dropdown } from 'react-bootstrap';

const BlogControls = ({ searchTerm, handleSearch, handleCategorySelect }) => (
  <Row className="mt-3">
    <Col md={3}>
      <Dropdown>
        <Dropdown.Toggle variant="primary" id="dropdown-categories">
          Categories
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => handleCategorySelect("")}>All</Dropdown.Item>
          <Dropdown.Item onClick={() => handleCategorySelect("Economics")}>Economics</Dropdown.Item>
          <Dropdown.Item onClick={() => handleCategorySelect("Finance")}>Finance</Dropdown.Item>
          <Dropdown.Item onClick={() => handleCategorySelect("Investment Tips")}>Investment Tips</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Col>
    <Col md={9}>
      <Form className="d-flex">
        <Form.Control
          type="search"
          placeholder="Search articles"
          className="me-2"
          aria-label="Search"
          value={searchTerm}
          onChange={handleSearch}
        />
        <Button variant="outline-success">Search</Button>
      </Form>
    </Col>
  </Row>
);

export default BlogControls;
