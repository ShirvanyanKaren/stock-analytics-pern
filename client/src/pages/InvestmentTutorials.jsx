import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Dropdown, Card } from 'react-bootstrap';
import './InvestmentTutorials.css'; // Import the CSS file for animations

const InvestmentTutorials = () => {
  const [tutorials, setTutorials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTutorial, setExpandedTutorial] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetch('/tutorials.json')
      .then(response => response.json())
      .then(data => setTutorials(data));
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const filteredTutorials = tutorials.filter(tutorial =>
    (selectedCategory ? tutorial.category === selectedCategory : true) &&
    tutorial.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <Row className="mt-3">
        <Col>
          <Card className="tutorials-card">
            <Card.Body>
              <h1>Investment Tutorials</h1>
              <p>Learn about investing in stocks, options, and more.</p>
              <Row className="mt-3">
                <Col md={3}>
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
                    <Card className={`expandable-card ${expandedTutorial === tutorial.id ? 'expanded' : ''}`}>
                      <Card.Body>
                        <Card.Title>{tutorial.title}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">{tutorial.category}</Card.Subtitle>
                        <Card.Text>
                          {expandedTutorial === tutorial.id ? tutorial.content : tutorial.summary}
                        </Card.Text>
                        <Button
                          variant="primary"
                          onClick={() => setExpandedTutorial(expandedTutorial === tutorial.id ? null : tutorial.id)}
                        >
                          {expandedTutorial === tutorial.id ? 'Show Less' : 'Read More'}
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default InvestmentTutorials;