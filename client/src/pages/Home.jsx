import { useEffect, useState, useReducer } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPortfolio } from '../services/portfolios';
import {useDispatch, useSelector} from "react-redux";
import { getStockWeights, getStockObject, idbPromise } from '../utils/helpers';
import { SET_STOCK_WEIGHTS } from '../utils/actions';
import Auth  from '../utils/auth'
import decode from 'jwt-decode';


const Home = () => {
const [decodedToken, setToken] = useState('');
const [stockWeights, setStockWeights] = useState({});
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
    console.log('Stock weights already exist in the store') 
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
        <div className='container d-flex justify-content-center'>
          { loading && Auth.loggedIn()? (
            <div className='container row justify-content-center'>
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className='container mt-5 d-flex justify-content-center'>
            <h1>Setting eveything up. This will only take a moment</h1>
            </div>
            </div>
          ) : (
        <div className='card text-center mt-5 w-50 h-300 home-card'>
            <div className='card-header'>
                <h2> Welcome to Cinco Data</h2>
            </div>
            <div className='card-body'>
                <h5 className='card-title'>Create your own portfolio</h5>
                {( 
                    Auth.loggedIn()  ? 
                    <>
                    <p className='card-text'>Welcome to CincoData. Click on the Add Portfolio button to get started</p>
                    <button className='btn btn-primary'>Add Portfolio</button>
                    </>
                    :
                    <>
                    <p className='card-text'>Login or Signup to get started</p>
                    <a href='/login' className='btn btn-primary me-3'>Login</a>
                    <a href='/signup' className='btn btn-primary ms-3'>Signup</a>
                    </>

            
                )}
                </div>
                <div className='card-footer text-muted'>
                    <h2>Happy Investing!</h2>
                </div>  
        </div>
        )}
        </div>
                  
    )

}

export default Home