// src/components/Tutorials/TutorialCard.jsx

import React from 'react';
import { Card, Button } from 'react-bootstrap';

const TutorialCard = ({ tutorial, expandedTutorial, setExpandedTutorial, setSelectedSection }) => {
  return (
    <Card key={tutorial.id} className={`expandable-card article-card ${expandedTutorial === tutorial.id ? 'expanded' : ''}`}>
      <Card.Body>
        <Card.Title>{tutorial.title}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">{tutorial.category}</Card.Subtitle>
        <Card.Text dangerouslySetInnerHTML={{ __html: expandedTutorial === tutorial.id ? tutorial.summary : tutorial.summary.slice(0, 100) + '...' }} />
        <Button
          variant="primary"
          onClick={() => {
            setExpandedTutorial(expandedTutorial === tutorial.id ? null : tutorial.id);
            setSelectedSection(null);
          }}
        >
          {expandedTutorial === tutorial.id ? 'Show Less' : 'Read More'}
        </Button>
      </Card.Body>
    </Card>
  );
};

export default TutorialCard;
