import React, { useEffect, useState } from 'react';
import { fetchStockStatistics } from '../utils/helpers'; // Import the new helper function
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

const StockStatisticsCard = ({ symbol }) => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleSections, setVisibleSections] = useState({});

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

  const toggleSection = (section) => {
    setVisibleSections((prevVisibleSections) => ({
      ...prevVisibleSections,
      [section]: !prevVisibleSections[section],
    }));
  };

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
        <ListGroup.Item>
          <Button onClick={() => toggleSection('companyDetails')}>Company Details</Button>
          {visibleSections.companyDetails && (
            <div>
              <p><strong>Address:</strong> {statistics.address1}</p>
              <p><strong>City:</strong> {statistics.city}</p>
              <p><strong>State:</strong> {statistics.state}</p>
              <p><strong>ZIP:</strong> {statistics.zip}</p>
              <p><strong>Country:</strong> {statistics.country}</p>
              <p><strong>Phone:</strong> {statistics.phone}</p>
              <p><strong>Website:</strong> <a href={statistics.website}>{statistics.website}</a></p>
              <p><strong>Industry:</strong> {statistics.industry}</p>
              <p><strong>Sector:</strong> {statistics.sector}</p>
              <p><strong>Full-time Employees:</strong> {statistics.fullTimeEmployees}</p>
            </div>
          )}
        </ListGroup.Item>
        <ListGroup.Item>
          <Button onClick={() => toggleSection('businessSummary')}>Business Summary</Button>
          {visibleSections.businessSummary && (
            <p>{statistics.longBusinessSummary}</p>
          )}
        </ListGroup.Item>
        <ListGroup.Item>
          <Button onClick={() => toggleSection('companyOfficers')}>Company Officers</Button>
          {visibleSections.companyOfficers && (
            <ListGroup variant="flush">
              {renderCompanyOfficers(statistics.companyOfficers)}
            </ListGroup>
          )}
        </ListGroup.Item>
        <ListGroup.Item>
          <Button onClick={() => toggleSection('stockInfo')}>Stock Information</Button>
          {visibleSections.stockInfo && (
            <div>
              <p><strong>Previous Close:</strong> {statistics.previousClose}</p>
              <p><strong>Open:</strong> {statistics.open}</p>
              <p><strong>Day Low:</strong> {statistics.dayLow}</p>
              <p><strong>Day High:</strong> {statistics.dayHigh}</p>
              <p><strong>Volume:</strong> {statistics.volume}</p>
              <p><strong>Market Cap:</strong> {statistics.marketCap}</p>
              <p><strong>PE Ratio (TTM):</strong> {statistics.trailingPE}</p>
              <p><strong>Forward PE:</strong> {statistics.forwardPE}</p>
              <p><strong>EPS (TTM):</strong> {statistics.trailingEps}</p>
              <p><strong>Forward EPS:</strong> {statistics.forwardEps}</p>
              <p><strong>Dividend Rate:</strong> {statistics.dividendRate}</p>
              <p><strong>Dividend Yield:</strong> {statistics.dividendYield}</p>
              <p><strong>Beta:</strong> {statistics.beta}</p>
              <p><strong>52 Week High:</strong> {statistics.fiftyTwoWeekHigh}</p>
              <p><strong>52 Week Low:</strong> {statistics.fiftyTwoWeekLow}</p>
              <p><strong>50 Day Average:</strong> {statistics.fiftyDayAverage}</p>
              <p><strong>200 Day Average:</strong> {statistics.twoHundredDayAverage}</p>
            </div>
          )}
        </ListGroup.Item>
        <ListGroup.Item>
          <Button onClick={() => toggleSection('financialRatios')}>Financial Ratios</Button>
          {visibleSections.financialRatios && (
            <div>
              <p><strong>Price to Sales (TTM):</strong> {statistics.priceToSalesTrailing12Months}</p>
              <p><strong>Price to Book:</strong> {statistics.priceToBook}</p>
              <p><strong>PEG Ratio:</strong> {statistics.pegRatio}</p>
              <p><strong>Enterprise Value:</strong> {statistics.enterpriseValue}</p>
              <p><strong>Enterprise to Revenue:</strong> {statistics.enterpriseToRevenue}</p>
              <p><strong>Enterprise to EBITDA:</strong> {statistics.enterpriseToEbitda}</p>
              <p><strong>Profit Margins:</strong> {statistics.profitMargins}</p>
              <p><strong>Return on Assets:</strong> {statistics.returnOnAssets}</p>
              <p><strong>Return on Equity:</strong> {statistics.returnOnEquity}</p>
              <p><strong>Revenue per Share:</strong> {statistics.revenuePerShare}</p>
              <p><strong>Gross Margins:</strong> {statistics.grossMargins}</p>
              <p><strong>EBITDA Margins:</strong> {statistics.ebitdaMargins}</p>
              <p><strong>Operating Margins:</strong> {statistics.operatingMargins}</p>
              <p><strong>Free Cash Flow:</strong> {statistics.freeCashflow}</p>
            </div>
          )}
        </ListGroup.Item>
        <ListGroup.Item>
          <Button onClick={() => toggleSection('riskMetrics')}>Risk Metrics</Button>
          {visibleSections.riskMetrics && (
            <div>
              <p><strong>Audit Risk:</strong> {statistics.auditRisk}</p>
              <p><strong>Board Risk:</strong> {statistics.boardRisk}</p>
              <p><strong>Compensation Risk:</strong> {statistics.compensationRisk}</p>
              <p><strong>Shareholder Rights Risk:</strong> {statistics.shareHolderRightsRisk}</p>
              <p><strong>Overall Risk:</strong> {statistics.overallRisk}</p>
            </div>
          )}
        </ListGroup.Item>
      </ListGroup>
    </Card>
  );
};

export default StockStatisticsCard;
