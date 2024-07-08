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
    const decoded = Auth.loggedIn() ? Auth.getProfile() : '';
    console.log('decoded:', decoded);
    if (Object.keys(CheckStockWeights).length > 0) return;
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
            <div className="hero-content">
              <h2>Using data to help you trade smarter</h2>
              <h4>CincoData is built by retail investors for retail investors. Learn how to invest and use financial data all in one place.</h4>
            </div>
          </section>
          <section className="features">
            <div className="feature-card">
              <img src="src/assets/Financial_Data.png" alt="Financial Data" />
              <span>Financial Data</span>
            </div>
            <div className="feature-card">
              <img src="src/assets/Analysis_Tools.png" alt="Analysis Tools" />
              <span>Analysis Tools</span>
            </div>
            <div className="feature-card">
              <img src="src/assets/Learning_AI.png" alt="Learning" />
              <span>Learning</span>
            </div>
            <div className="feature-card">
              <img src="src/assets/CincoData_+.png" alt="CincoData+" />
              <span>CincoData+</span>
            </div>
          </section>
          <section className="newsletter ">
            <input type="email" placeholder="your email@domain.com" className="text-center"/>
            <button type="submit" className="button-2">Subscribe</button>
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
