import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../../styles/Blog.css';

const BlogContainer = () => {
  const [articles, setArticles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/articles.json')
      .then(response => response.json())
      .then(data => setArticles(data));
  }, []);

  const handleArticleClick = (id) => {
    navigate(`/article/${id}`);
  };

  return (
    <Container fluid className="blog-container">
      <Row>
        <Col>
          <h1 className="blog-title">News</h1>
        </Col>
      </Row>
      <Row>
        <Col md={8} onClick={() => handleArticleClick(articles[0]?.id)}>
          <Card className="main-article">
            <Card.Body>
              <span className="category">{articles[0]?.category}</span>
              <h2>{articles[0]?.title}</h2>
              <p className="summary">{articles[0]?.summary}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          {articles.slice(1, 5).map((article) => (
            <Card key={article.id} className="sidebar-article" onClick={() => handleArticleClick(article.id)}>
              <Card.Body>
                <span className="category">{article.category}</span>
                <h3>{article.title}</h3>
                <p className="summary">{article.summary}</p>
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
        {articles.slice(5).map((article) => (
          <Col md={4} key={article.id} onClick={() => handleArticleClick(article.id)}>
            <Card className="latest-article">
              <Card.Body>
                <span className="category">{article.category}</span>
                <h3>{article.title}</h3>
                <p className="summary">{article.summary}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default BlogContainer;