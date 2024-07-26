import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ArticleModal = ({ show, onHide, article, onPrevious, onNext, isFirst, isLast }) => {
  if (!article) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{article.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <img src={article.imageUrl} alt="Article" style={{ width: '100%' }} />
        <p>{article.content}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onPrevious} disabled={isFirst}>
          Previous
        </Button>
        <Button variant="primary" onClick={onNext} disabled={isLast}>
          Next
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ArticleModal;