import React from 'react';
import { Card, Button } from 'react-bootstrap';

const BlogList = ({ currentArticles, expandedArticle, setExpandedArticle }) => (
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
);

export default BlogList;
