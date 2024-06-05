import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Dropdown, Card } from 'react-bootstrap';

const InvestmentTutorials = () => {
  const [tutorials, setTutorials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch('/tutorials.json')
      .then(response => response.json())
      .then(data => setTutorials(data));
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredTutorials = tutorials.filter(tutorial =>
    tutorial.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <Row className="mt-3">
        <Col>
          <h1>Investment Tutorials</h1>
          <p>Learn about investing in stocks, options, and more.</p>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={3}>
          <Dropdown>
            <Dropdown.Toggle variant="primary" id="dropdown-categories">
              Categories
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item href="#/action-1">Stocks</Dropdown.Item>
              <Dropdown.Item href="#/action-2">Options</Dropdown.Item>
              <Dropdown.Item href="#/action-3">Bonds</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        <Col md={9}>
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
        </Col>
      </Row>
      <Row className="mt-3">
        {filteredTutorials.map(tutorial => (
          <Col key={tutorial.id} md={4} className="mb-3">
            <Card>
              <Card.Body>
                <Card.Title>{tutorial.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{tutorial.category}</Card.Subtitle>
                <Card.Text>{tutorial.summary}</Card.Text>
                <Button
                  variant="primary"
                  onClick={() => alert(tutorial.content)}
                >
                  Read More
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default InvestmentTutorials;
