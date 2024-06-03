// hooks/useFinancialData.js
import { useState, useEffect } from 'react';

const useFinancialData = (symbol, statement, isQuarters) => {
  const [financials, setFinancials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://www.cincodata.com/financial_statement?ticker=${symbol}&statement=${statement}&frequency=${isQuarters ? 'quarterly' : 'annual'}`);
        const data = await response.json();
        setFinancials(data); // Assume the API returns the data array directly
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [symbol, statement, isQuarters]);

  return { financials, isLoading, error };
};

export default useFinancialData;
