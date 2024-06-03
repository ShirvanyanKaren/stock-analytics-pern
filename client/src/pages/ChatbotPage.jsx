import React, { useState } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import UserInput from "../components/UserInput.jsx";
import { useTable } from 'react-table';
import '../customStyles.css';

const API_KEY = "your-api-key-here";

async function fetchFinancialStratement(ticker, statementType, frequency) {
  try {
    const response = await fetch(`http://localhost:8000/financial_statement?ticker=${ticker}&statement=${statementType}&frequency=${frequency}`);
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

function transposeData(data) {
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

function formatFinancialData(data) {
  let formattedData = "Financial Statement Data:\n";
  data.forEach(row => {
    const metric = row.metric;
    const values = Object.values(row).slice(1); // exclude the 'metric' key
    formattedData += `${metric}: ${values.join(', ')}\n`;
  });
  return formattedData;
}

function ChatbotPage() {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [financialData, setFinancialData] = useState(null);
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [userInput, setUserInput] = useState({ ticker: '', statementType: '', frequency: '' });

  const handleUserInputSubmit = async (ticker, statementType, frequency) => {
    try {
      setUserInput({ ticker, statementType, frequency });
      const financialStatementData = await fetchFinancialStatement(ticker, statementType, frequency);
      console.log('Financial Statement Data:', financialStatementData);
  
      if (financialStatementData && Array.isArray(financialStatementData)) {
        const transposedData = transposeData(financialStatementData);

        const columns = transposedData.length > 0 ? Object.keys(transposedData[0]).map(key => ({
          Header: key === 'metric' ? 'Metric' : key, 
          accessor: key
        })) : [];
  
        // Ensure 'Metric' column is the first one
        const orderedColumns = columns.sort((a, b) => (a.Header === 'Metric' ? -1 : b.Header === 'Metric' ? 1 : 0));
  
        setColumns(orderedColumns);
        setData(transposedData);
        setFinancialData(transposedData);
      } else {
        console.error("Received data is not an array:", financialStatementData);
      }
    } catch (error) {
      console.error("Error handling user input submit:", error);
    }
  };
  
  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "User",
      direction: "outgoing"
    };
    const newMessages = [...messages, newMessage];

    setMessages(newMessages);
    setTyping(true);

    await processMessageToChatGPT(newMessages, message);
  };

  const processMessageToChatGPT = async (chatMessages, userMessage) => {
    const { ticker } = userInput;
    const formattedFinancialData = financialData ? formatFinancialData(financialData) : '';

    const combinedMessage = `Ticker: ${ticker}, ${userMessage}\n${formattedFinancialData}`;

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    apiMessages.push({ role: "user", content: combinedMessage });

    // Set the current date explicitly to a date in 2024
    const currentDate = "2024-05-31";
    const systemMessage = {
      role: "system",
      content: `IT IS CURRENTLY ${currentDate}. You are a 30 year veteran-financial analyst / portfolio manager in ${currentDate} and are now providing easy to understand definitions of financial terms when asked. You also review the financial data given and when asked, you provide insight on the trends of the data. DO NOT ANSWER ANYTHING ELSE if you are asked something that is not from the data given.`
    };

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        systemMessage,
        ...apiMessages
      ]
    };

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
      });
      const data = await response.json();
      const responseMessage = {
        message: data.choices[0].message.content,
        sender: "ChatGPT",
        direction: "incoming"
      };
      setMessages([...chatMessages, responseMessage]);
      setTyping(false);
    } catch (error) {
      console.error('Error processing message to ChatGPT:', error);
      setTyping(false);
    }
  };

  const Table = ({ columns, data }) => {
    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      rows,
      prepareRow,
    } = useTable({
      columns,
      data,
    });
  
    return (
      <div className="table-container">
        <table {...getTableProps()} className="financial-table">
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row, i) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="form-container">
        <UserInput onSubmit={handleUserInputSubmit} />
      </div>
      <div className="content-container">
        <div className="table-container">
          {columns.length > 0 && data.length > 0 && (
            <Table columns={columns} data={data} />
          )}
        </div>
        <div className="chat-container">
          <MainContainer>
            <ChatContainer>
              <MessageList
                typingIndicator={typing ? <TypingIndicator content="ChatGPT is typing..." /> : null}
              >
                {messages.map((message, i) => (
                  <Message key={i} model={message} />
                ))}
              </MessageList>
              <MessageInput placeholder="Type message here" onSend={handleSend} />
            </ChatContainer>
          </MainContainer>
        </div>
      </div>
    </div>
  );
}

export default ChatbotPage;
