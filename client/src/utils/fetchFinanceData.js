// src/utils/fetchFinanceData.js

export async function fetchFinancialStatement(ticker, statementType, frequency) {
    try {
      const response = await fetch(`https://www.cincodata.com/financial_statement?ticker=${ticker}&statement=${statementType}&frequency=${frequency}`);
      console.log('Fetch response:', response);
      if (!response.ok) {
        const message = `An error has occurred: ${response.status}`;
        throw new Error(message);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching financial statement:", error);
      throw error;
    }
  }
  
  export function transposeData(data) {
    const transposed = {};
    data.forEach((row, rowIndex) => {
      Object.entries(row).forEach(([key, value]) => {
        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
        if (!transposed[formattedKey]) {
          transposed[formattedKey] = [];
        }
        transposed[formattedKey][rowIndex] = value;
      });
    });
  
    return Object.entries(transposed).map(([key, values]) => ({ metric: key, ...values }));
  }
  
  export function formatFinancialData(data) {
    let formattedData = "Financial Statement Data:\n";
    data.forEach(row => {
      const metric = row.metric;
      const values = Object.values(row).slice(1); // exclude the 'metric' key
      formattedData += `${metric}: ${values.join(', ')}\n`;
    });
    return formattedData;
  }
  