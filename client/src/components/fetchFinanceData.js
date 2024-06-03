export const fetchFinancialStatement = async (ticker, statementType, frequency) => {
    const apiUrl = `https://www.cincodata.com/financial_statement?ticker=${ticker}&statement=${statementType}&frequency=${frequency}`;
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const message = `An error has occurred: ${response.status}`;
        throw new Error(message);
      }
  
      return await response.json(); // Ensure response is JSON
    } catch (error) {
      console.error("Error fetching financial statement:", error);
      throw error;
    }
  };
  