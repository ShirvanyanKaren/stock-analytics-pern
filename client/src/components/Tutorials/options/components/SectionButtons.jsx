// src/components/Tutorials/options/components/SectionButtons.jsx

import React from "react";
import { Button } from "react-bootstrap";

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
    <>
      {expandedTutorialData && expandedTutorialData.content.sections.map((section, index) => (
        <Button
          key={index}
          className="section-header"
          onClick={() => scrollToSection(index)}
        >
          {section.header}
        </Button>
      ))}
    </>
  );
};

export default SectionButtons;
