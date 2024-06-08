// src/components/Tutorials/options/components/CustomCarousel.jsx

import React from "react";
import { Card, Carousel } from "react-bootstrap";

const CustomCarousel = ({ items }) => {
  return (
    <Carousel>
      {items.map((item, index) => (
        <Carousel.Item key={index}>
          <Card>
            <Card.Body>
              <Card.Title>{item.title}</Card.Title>
              <Card.Text dangerouslySetInnerHTML={{ __html: item.text }} />
            </Card.Body>
          </Card>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default CustomCarousel;
