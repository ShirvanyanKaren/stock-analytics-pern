// src/pages/StandardDeviation.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Image, Table, Card, Carousel } from 'react-bootstrap';
import '../styles/STD.css';

const StandardDeviation = () => {
  const [symbol, setSymbol] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [results, setResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get('http://127.0.0.1:8000/standard-deviation', {
        params: { symbol, start_date: startDate, end_date: endDate }
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching standard deviation data:', error);
    }
  };

  return (
    <Container>
      <h1>Standard Deviation Analysis</h1>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col>
            <Form.Group>
              <Form.Label>Ticker Symbol</Form.Label>
              <Form.Control 
                type="text" 
                value={symbol} 
                onChange={(e) => setSymbol(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>Start Date</Form.Label>
              <Form.Control 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>End Date</Form.Label>
              <Form.Control 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Button type="submit" className="mt-3">Analyze</Button>
      </Form>

      {results && (
        <div className="mt-4">
          <Row>
            <Col md={12}>
              <Card>
                <Card.Header>Statistics</Card.Header>
                <Card.Body>
                  <Table striped bordered hover>
                    <tbody>
                      <tr>
                        <td>Daily Std Dev</td>
                        <td>{results.stats.daily_std?.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Weekly Std Dev</td>
                        <td>{results.stats.weekly_std?.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Monthly Std Dev</td>
                        <td>{results.stats.monthly_std?.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Current Price</td>
                        <td>{results.stats.current_price?.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Card>
                <Card.Header>Price Table</Card.Header>
                <Card.Body>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Frequency</th>
                        <th>1st Std Dev (-)</th>
                        <th>1st Std Dev (+)</th>
                        <th>2nd Std Dev (-)</th>
                        <th>2nd Std Dev (+)</th>
                        <th>3rd Std Dev (-)</th>
                        <th>3rd Std Dev (+)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.prices_table?.Frequency && results.prices_table.Frequency.map((freq, index) => (
                        <tr key={index}>
                          <td>{freq}</td>
                          <td>{results.prices_table['1st Std Deviation (-)']?.[index]?.toFixed(2)}</td>
                          <td>{results.prices_table['1st Std Deviation (+)']?.[index]?.toFixed(2)}</td>
                          <td>{results.prices_table['2nd Std Deviation (-)']?.[index]?.toFixed(2)}</td>
                          <td>{results.prices_table['2nd Std Deviation (+)']?.[index]?.toFixed(2)}</td>
                          <td>{results.prices_table['3rd Std Deviation (-)']?.[index]?.toFixed(2)}</td>
                          <td>{results.prices_table['3rd Std Deviation (+)']?.[index]?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Card>
                <Card.Header>Frequency Table</Card.Header>
                <Card.Body>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Bins</th>
                        <th>Qty</th>
                        <th>Qty%</th>
                        <th>Cum%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.frequency_table?.Bins && results.frequency_table.Bins.map((bin, index) => (
                        <tr key={index}>
                          <td>{bin}</td>
                          <td>{results.frequency_table.Qty?.[index]}</td>
                          <td>{results.frequency_table['Qty%']?.[index]}</td>
                          <td>{results.frequency_table['Cum%']?.[index]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Card>
                <Card.Header>Stats Data</Card.Header>
                <Card.Body>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Statistic</th>
                        <th>Value</th>
                        <th>Percent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.stats_df?.Statistic && results.stats_df.Statistic.map((stat, index) => (
                        <tr key={index}>
                          <td>{stat}</td>
                          <td>{results.stats_df.Value?.[index]}</td>
                          <td>{results.stats_df.Percent?.[index] || ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Card>
                <Card.Header>Frequency Bar Chart</Card.Header>
                <Card.Body>
                  <Image src={`data:image/png;base64,${results.frequency_bar_chart}`} fluid />
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Card>
                <Card.Header>Standard Deviation Graphs</Card.Header>
                <Card.Body>
                  <Carousel>
                    <Carousel.Item>
                      <Image src={`data:image/png;base64,${results.daily_plot}`} fluid />
                      <Carousel.Caption>
                        <h3>Daily Distribution</h3>
                      </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                      <Image src={`data:image/png;base64,${results.weekly_plot}`} fluid />
                      <Carousel.Caption>
                        <h3>Weekly Distribution</h3>
                      </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                      <Image src={`data:image/png;base64,${results.monthly_plot}`} fluid />
                      <Carousel.Caption>
                        <h3>Monthly Distribution</h3>
                      </Carousel.Caption>
                    </Carousel.Item>
                  </Carousel>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Card>
                <Card.Header>Histograms</Card.Header>
                <Card.Body>
                  <Image src={`data:image/png;base64,${results.histogram_plot}`} fluid />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </Container>
  );
};

export default StandardDeviation;
