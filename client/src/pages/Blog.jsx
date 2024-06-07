import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Dropdown, Card } from 'react-bootstrap';
import './Blog.css'; // Import the CSS file for animations

const Blog = () => {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 9; // Number of articles per page

  useEffect(() => {
    fetch('/articles.json')
      .then(response => response.json())
      .then(data => setArticles(data));
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page on category change
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const filteredArticles = articles.filter(article =>
    (selectedCategory ? article.category === selectedCategory : true) &&
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

  return (
    <Container>
      <Row className="mt-3">
        <Col>
          <Card className="blog-card">
            <Card.Body>
              <h1>Blog</h1>
              <p>Welcome to the blog page. Here you can find articles on economic and finance topics.</p>
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
              <div className="article-grid mt-3">
                {currentArticles.map(article => (
                  <Card key={article.id} className={`expandable-card article-card ${expandedArticle === article.id ? 'expanded' : ''}`}>
                    <Card.Body>
                      <Card.Title>{article.title}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">{article.category}</Card.Subtitle>
                      <Card.Text>
                        {expandedArticle === article.id ? article.summary : article.content.slice(0, 100) + '...'}
                      </Card.Text>
                      <Button
                        variant="primary"
                        onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                      >
                        {expandedArticle === article.id ? 'Show Less' : 'Read More'}
                      </Button>
                    </Card.Body>
                  </Card>
                ))}
              </div>
              <Row className="pagination-controls">
                <Col>
                  <Button
                    variant="outline-primary"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  {[...Array(totalPages)].map((_, index) => (
                    <Button
                      key={index}
                      variant="outline-primary"
                      onClick={() => handlePageChange(index + 1)}
                      className={currentPage === index + 1 ? 'active' : ''}
                    >
                      {index + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline-primary"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </Button>
                </Col>
              </Row>
              <Row className="full-article-container">
                {expandedArticle && (
                  <Col md={12} className="full-article visible">
                    <Card>
                      <Card.Body>
                        <Card.Title>{articles.find(article => article.id === expandedArticle).title}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">{articles.find(article => article.id === expandedArticle).category}</Card.Subtitle>
                        <Card.Text>
                          {articles.find(article => article.id === expandedArticle).content}
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Blog;
