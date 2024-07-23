import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Modal, Button } from 'react-bootstrap';
import '../../styles/Blog.css';

const BlogContainer = () => {
  const [articles, setArticles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedArticleIndex, setSelectedArticleIndex] = useState(0);

  useEffect(() => {
    fetch('/articles.json')
      .then(response => response.json())
      .then(data => setArticles(data));
  }, []);

  const handleShowModal = (index) => {
    setShowModal(true);
    setSelectedArticleIndex(index);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handlePrevArticle = () => {
    if (selectedArticleIndex > 0) {
      setSelectedArticleIndex(selectedArticleIndex - 1);
    }
  };

  const handleNextArticle = () => {
    if (selectedArticleIndex < articles.length - 1) {
      setSelectedArticleIndex(selectedArticleIndex + 1);
    }
  };

  return (
    <Container fluid className="blog-container">
      <Row>
        <Col>
          <h1 className="blog-title">News</h1>
        </Col>
      </Row>
      <Row>
        <Col md={8} onClick={() => handleShowModal(0)}>
          <Card className="main-article">
            <Card.Body>
              <span className="category">Startups</span>
              <h2>{articles[0]?.title}</h2>
              <p className="author">{articles[0]?.author}</p>
              <div className="article-image"></div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          {articles.slice(1, 5).map((article, index) => (
            <Card key={index} className="sidebar-article" onClick={() => handleShowModal(index + 1)}>
              <Card.Body>
                <span className="category">AI</span>
                <h3>{article.title}</h3>
                <p className="author">{article.author}</p>
              </Card.Body>
            </Card>
          ))}
        </Col>
      </Row>
      <Row>
        <Col>
          <h2 className="latest-title">The Latest</h2>
        </Col>
      </Row>
      <Row>
        {articles.slice(5).map((article, index) => (
          <Col md={4} key={index} onClick={() => handleShowModal(index + 5)}>
            <Card className="latest-article">
              <Card.Body>
                <span className="category">AI</span>
                <h3>{article.title}</h3>
                <p className="author">{article.author} | {article.date}</p>
                <p className="summary">{article.summary}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Article Detail Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{articles[selectedArticleIndex]?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <img src={articles[selectedArticleIndex]?.imageUrl} alt="Article" style={{ width: '100%' }} />
          <p>{articles[selectedArticleIndex]?.content}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handlePrevArticle} disabled={selectedArticleIndex === 0}>
            Previous
          </Button>
          <Button variant="primary" onClick={handleNextArticle} disabled={selectedArticleIndex === articles.length - 1}>
            Next
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BlogContainer;
