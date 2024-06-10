import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';

const FullArticle = ({ expandedArticle, articles }) => {
  if (!expandedArticle) return null;

  const article = articles.find(article => article.id === expandedArticle);

  return (
    <Row className="full-article-container">
      <Col md={12} className="full-article visible">
        <Card>
          <Card.Body>
            <Card.Title>{article.title}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">{article.category}</Card.Subtitle>
            <Card.Text>{article.content}</Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default FullArticle;
