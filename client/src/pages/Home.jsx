import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { getPortfolio } from '../services/portfolios';
import { getStockWeights, idbPromise } from '../utils/helpers';
import { SET_STOCK_WEIGHTS } from '../utils/actions';
import Auth from '../utils/auth';
import decode from 'jwt-decode';

const Home = () => {


  return (
    <div className="container">
      {/* {loading && Auth.loggedIn() ? (
        <div className="container row justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="container mt-5 d-flex justify-content-center">
            <h1>Setting everything up. This will only take a moment</h1>
          </div>
        </div>
      ) : ( */}
        <>
          <section className="hero">
            <div className="hero-content">
              <h2>Understand and Analyze Markets</h2>
              <h4>Research your favorite stock while learning</h4>
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
      {/* )} */}
    </div>
  );
};

export default Home;
