// src/components/Tutorials/SectionButtons.jsx

import React from "react";
import { Button, Container, Row, Col } from "react-bootstrap";

const SectionButtons = ({ expandedTutorialData, handleSectionSelect }) => {
  const scrollToSection = (sectionIndex) => {
    const sectionId = `section-${sectionIndex}`;
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth" });
    }
    handleSectionSelect(sectionIndex);
  };

  return (
    <Container className="section-buttons-container">
      <Row>
        {expandedTutorialData && expandedTutorialData.content.sections.map((section, index) => (
          <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-3">
            <Button
              className="section-button w-100"
              variant="outline-primary"
              onClick={() => scrollToSection(index)}
            >
              {section.header}
            </Button>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default SectionButtons;