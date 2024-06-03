export const fetchFinancialStatement = async (ticker, statementType, frequency) => {
    const apiUrl = `https://www.cincodata.com/financial_statement?ticker=${ticker}&statement=${statementType}&frequency=${frequency}`;
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',  // GET is default, specifying it for clarity
            headers: {
                'Content-Type': 'application/json',  // Ensure server expects JSON
            },
        });

        if (!response.ok) {
            const errorDetail = await response.text();  // Fetching text to get detailed error message from server
            throw new Error(`Network response was not ok: ${errorDetail}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch financial statement:', error);
        return null;  // Consider how to handle this null in your React components
    }
};
