import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import CallsAndPutsTutorial from '../components/graphs/CallsAndPutsTutorial';
import ExpirationsTutorial from '../components/graphs/ExpirationsTutorial';
import GreeksTutorial from '../components/graphs/GreeksTutorial';
import TradingStrategiesTutorial from '../components/graphs/TradingStrategiesTutorial';
import ConclusionTutorial from '../components/graphs/ConclusionTutorial';
import CustomCarousel from '../components/Tutorials/CustomCarousel';
import SearchBar from '../components/Tutorials/SearchBar';
import CategoryDropdown from '../components/Tutorials/CategoryDropdown';
import TutorialCard from '../components/Tutorials/TutorialCard';
import PaginationControls from '../components/Tutorials/PaginationControls';
import SectionButtons from '../components/Tutorials/SectionButtons';
import "../styles/InvestmentTutorials.css";

const InvestmentTutorials = () => {
  const [tutorials, setTutorials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTutorial, setExpandedTutorial] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSection, setSelectedSection] = useState(null);
  const tutorialsPerPage = 9;

  useEffect(() => {
    fetch('/tutorials.json')
      .then(response => response.json())
      .then(data => setTutorials(data))
      .catch(error => console.error('Error fetching tutorials:', error));
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSectionSelect = (sectionIndex) => {
    setSelectedSection(sectionIndex);
  };

  const filteredTutorials = tutorials.filter(tutorial =>
    (selectedCategory ? tutorial.category === selectedCategory : true) &&
    tutorial.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastTutorial = currentPage * tutorialsPerPage;
  const indexOfFirstTutorial = indexOfLastTutorial - tutorialsPerPage;
  const currentTutorials = filteredTutorials.slice(indexOfFirstTutorial, indexOfLastTutorial);
  const totalPages = Math.ceil(filteredTutorials.length / tutorialsPerPage);

  const expandedTutorialData = tutorials.find(tutorial => tutorial.id === expandedTutorial);

  const renderSectionContent = (section, index) => {
    const items = section.content
      ? [{ title: section.header, text: section.content }]
      : section.items;

    switch (section.header) {
      case "Calls and Puts":
        return (
          <div id={`section-${index}`} className="calls-and-puts-section">
            <Row>
              <Col md={6}>
                <h5>Call Options</h5>
                <Card.Img variant="top" src="/Call intro tutorial.png" />
              </Col>
              <Col md={6}>
                <h5>Put Options</h5>
                <Card.Img variant="top" src="/Put intro tutorial.png" />
              </Col>
            </Row>
            <CustomCarousel
              items={[
                { title: "Call Options", text: "A call option gives you the right, not the obligation, to buy a stock at a predetermined price (strike price) within a certain time frame." },
                { title: "Easy Definition of Call Options", text: "If you believe a stock's price will rise, buying a call option lets you buy it cheaper later." },
                { title: "Put Options", text: "A put option gives you the right, not the obligation, to sell a stock at a predetermined price before the option expires." },
                { title: "Easy Definition of Put Options", text: "If you think a stock's price will fall, buying a put option lets you sell it at a higher price later." },
              ]}
            />
            <CallsAndPutsTutorial />
          </div>
        );
      case "Expirations":
        return (
          <div id={`section-${index}`}>
            <CustomCarousel items={items} />
            <ExpirationsTutorial />
          </div>
        );
      case "The Greeks and Factors Affecting Option Prices":
        return (
          <div id={`section-${index}`}>
            <h5>The Greeks</h5>
            <p>The Greeks are measures that describe different dimensions of risk in an options contract:</p>
            <CustomCarousel
              items={[
                { title: "Delta", text: "Shows how much an option's price is expected to move per a one-point change in the underlying asset." },
                { title: "Gamma", text: "Measures the rate of change in Delta and affects the stability of an option's price." },
                { title: "Vega", text: "Indicates how much the price of an option changes with a 1% change in implied volatility." },
                { title: "Rho", text: "Measures the sensitivity of an option's price to a change in interest rates." },
              ]}
            />
            <GreeksTutorial />
          </div>
        );
      case "Trading Strategies":
        return (
          <div id={`section-${index}`}>
            <h5>Trading Strategies</h5>
            <CustomCarousel
              items={[
                { title: "Covered Call", text: "This strategy involves holding a long position in a stock and selling a call option on the same stock to generate income from the option premium." },
                { title: "Protective Put", text: "Buying puts to guard against a decline in the stock price of assets you own." },
                { title: "Bull Call Spread", text: "Using two call options to capture profit in a moderately rising market." },
                { title: "Bear Put Spread", text: "A strategy that involves buying a put and selling another put at a lower strike price to benefit from a moderately falling market." },
              ]}
            />
            <TradingStrategiesTutorial />
          </div>
        );
      case "Conclusion: Value Investing vs. Trading":
        return (
          <div id={`section-${index}`}>
            <CustomCarousel items={items} />
            <ConclusionTutorial />
          </div>
        );
      default:
        return <p id={`section-${index}`}>{section.content}</p>;
    }
  };

  return (
    <Container className="investment-tutorials">
      <Card className="tutorials-card">
        <Card.Body>
          <h1>Investment Tutorials</h1>
          <Row className="search-category-row">
            <Col md={6}>
              <CategoryDropdown handleCategorySelect={handleCategorySelect} />
            </Col>
            <Col md={6}>
              <SearchBar searchTerm={searchTerm} handleSearch={handleSearch} />
            </Col>
          </Row>
          <div className="article-grid">
            {currentTutorials.map(tutorial => (
              <TutorialCard
                key={tutorial.id}
                tutorial={tutorial}
                expandedTutorial={expandedTutorial}
                setExpandedTutorial={setExpandedTutorial}
                setSelectedSection={setSelectedSection}
              />
            ))}
          </div>
          <Row className="pagination-controls">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
            />
          </Row>
          {expandedTutorial && (
            <>
              <SectionButtons
                expandedTutorialData={expandedTutorialData}
                handleSectionSelect={handleSectionSelect}
              />
              <Row className="full-article-container mt-4">
                {expandedTutorialData && selectedSection !== null && (
                  <Col md={12} className="full-article visible">
                    <Card>
                      <Card.Body>
                        <Card.Title>{expandedTutorialData.title}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">{expandedTutorialData.category}</Card.Subtitle>
                        <Card.Text>{expandedTutorialData.summary}</Card.Text>
                        <div className="section-content visible">
                          {renderSectionContent(expandedTutorialData.content.sections[selectedSection], selectedSection)}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                )}
              </Row>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default InvestmentTutorials;