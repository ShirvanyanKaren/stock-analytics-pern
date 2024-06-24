import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { getPortfolio } from '../services/portfolios';
import { getStockWeights, idbPromise } from '../utils/helpers';
import { SET_STOCK_WEIGHTS } from '../utils/actions';
import Auth from '../utils/auth';
import decode from 'jwt-decode';

const Home = () => {
  const [decodedToken, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const CheckStockWeights = useSelector((state) => state.stockWeights);
  const dispatch = useDispatch();

  const checkLoginPortfolios = async () => {
    const token = localStorage.getItem('id_token');
    if (!token || !Auth.loggedIn()) {
      setToken('');
      return;
    }
    const decoded = decode(token);
    setToken(decoded);
    if (Object.keys(CheckStockWeights).length > 0) {
      console.log('Stock weights already exist in the store');
      return;
    }
    try {
      const user_id = decoded.data.id;
      const portfolio = await getPortfolio(user_id);
      const stocks = portfolio.stocks;
      await idbPromise('stockWeights', 'put', {
        ...stocks,
        portfolio_id: portfolio.id
      });

      dispatch({
        type: SET_STOCK_WEIGHTS,
        payload: stocks
      });
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  };

  useEffect(() => {
    checkLoginPortfolios().finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      {loading && Auth.loggedIn() ? (
        <div className="container row justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="container mt-5 d-flex justify-content-center">
            <h1>Setting everything up. This will only take a moment</h1>
          </div>
        </div>
      ) : (
        <>
          <section className="hero">
            <h1>Using data to help you trade smarter</h1>
            <p>CincoData is built by retail investors for retail investors. Learn how to invest and use financial data all in one place.</p>
          </section>
          <section className="features">
            <div className="feature-card">
              <img src="/icons/financial-data.svg" alt="Financial Data" />
              <h3>Financial Data</h3>
            </div>
            <div className="feature-card">
              <img src="/icons/analysis-tools.svg" alt="Analysis Tools" />
              <h3>Analysis Tools</h3>
            </div>
            <div className="feature-card">
              <img src="/icons/learning.svg" alt="Learning" />
              <h3>Learning</h3>
            </div>
            <div className="feature-card">
              <img src="/icons/cincodata-plus.svg" alt="CincoData+" />
              <h3>CincoData+</h3>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
