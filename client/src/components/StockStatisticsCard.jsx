import React, { useEffect, useState } from 'react';
import { fetchStockStatistics } from '../utils/helpers'; // Import the new helper function
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Spinner from 'react-bootstrap/Spinner';

const StockStatisticsCard = ({ symbol }) => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getStockStatistics = async () => {
      try {
        const data = await fetchStockStatistics(symbol);
        setStatistics(data);
      } catch (err) {
        console.error('Error fetching stock statistics:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getStockStatistics();
  }, [symbol]);

  if (loading) {
    return <Spinner animation="border" />;
  }

  if (error) {
    return <div>Error loading stock statistics</div>;
  }

  const renderCompanyOfficers = (officers) => {
    return officers.map((officer, index) => (
      <ListGroup.Item key={index}>
        <strong>{officer.title}:</strong> {officer.name}, Age: {officer.age || 'N/A'}, Total Pay: ${officer.totalPay?.toLocaleString() || 'N/A'}, Year Born: {officer.yearBorn || 'N/A'}
      </ListGroup.Item>
    ));
  };

  return (
    <Card className="mt-3">
      <Card.Header>{statistics.longName} ({symbol}) Statistics</Card.Header>
      <ListGroup variant="flush">
        {Object.entries(statistics).map(([key, value]) => (
          <ListGroup.Item key={key}>
            <strong>{key}:</strong> {Array.isArray(value) ? renderCompanyOfficers(value) : (typeof value === 'object' ? JSON.stringify(value) : value)}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card>
  );
};

export default StockStatisticsCard;
