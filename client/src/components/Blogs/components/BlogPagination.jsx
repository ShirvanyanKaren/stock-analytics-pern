import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';

const BlogPagination = ({ currentPage, totalPages, handlePageChange }) => (
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
);

export default BlogPagination;
