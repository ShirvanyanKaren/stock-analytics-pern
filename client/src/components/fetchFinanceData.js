export const getCompanyFinancials = async (symbol, statement, isQuarters) => {
    const statementType = statement === "balance" ? "balanceSheet" : statement === "cash" ? "cashflowStatement" : "incomeStatement";
    const frequency = isQuarters ? "quarterly" : "annual";
    const apiUrl = `https://www.cincodata.com/financial_statement?ticker=${symbol}&statement=${statementType}&frequency=${frequency}`;
  
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
      
      return await response.text();
    } catch (error) {
      console.error("Error fetching financial statement:", error);
      throw error;
    }
  };
  