import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Dropdown, Card } from 'react-bootstrap';

const Blog = () => {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch('/articles.json')
      .then(response => response.json())
      .then(data => setArticles(data));
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <Row className="mt-3">
        <Col>
          <h1>Blog</h1>
          <p>Welcome to the blog page. Here you can find articles on economic and finance topics.</p>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={3}>
          <Dropdown>
            <Dropdown.Toggle variant="primary" id="dropdown-categories">
              Categories
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item href="#/action-1">Economics</Dropdown.Item>
              <Dropdown.Item href="#/action-2">Finance</Dropdown.Item>
              <Dropdown.Item href="#/action-3">Investment Tips</Dropdown.Item>
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
      <Row className="mt-3">
        {filteredArticles.map(article => (
          <Col key={article.id} md={4} className="mb-3">
            <Card>
              <Card.Body>
                <Card.Title>{article.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{article.category}</Card.Subtitle>
                <Card.Text>{article.summary}</Card.Text>
                <Button
                  variant="primary"
                  onClick={() => alert(article.content)}
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

export default Blog;
