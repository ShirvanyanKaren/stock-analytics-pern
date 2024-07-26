import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

const ArticlePage = () => {
  const [article, setArticle] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/articles.json')
      .then(response => response.json())
      .then(data => {
        const foundArticle = data.find(article => article.id === parseInt(id));
        setArticle(foundArticle);
      })
      .catch(error => console.error('Error fetching article:', error));
  }, [id]);

  if (!article) return <div>Loading...</div>;

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col>
          <h1>{article.title}</h1>
          <p className="text-muted">{article.category}</p>
          <p><strong>Summary:</strong> {article.summary}</p>
          <p>{article.content}</p>
        </Col>
      </Row>
    </Container>
  );
};

export default ArticlePage;