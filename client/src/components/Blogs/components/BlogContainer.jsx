// src/components/Blogs/components/BlogContainer.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import BlogHeader from './BlogHeader';
import BlogControls from './BlogControls';
import BlogList from './BlogList';
import BlogPagination from './BlogPagination';
import FullArticle from './FullArticle';
import '../Blog.css'; // Import the CSS file for animations

const BlogContainer = () => {
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
              <BlogHeader />
              <BlogControls 
                searchTerm={searchTerm}
                handleSearch={handleSearch}
                handleCategorySelect={handleCategorySelect}
              />
              <BlogList 
                currentArticles={currentArticles}
                expandedArticle={expandedArticle}
                setExpandedArticle={setExpandedArticle}
              />
              <BlogPagination 
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
              />
              <FullArticle 
                expandedArticle={expandedArticle}
                articles={articles}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BlogContainer;
