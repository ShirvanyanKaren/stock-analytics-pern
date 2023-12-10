import React from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import {useDispatch, useSelector} from "react-redux";
import { useReducer } from 'react';
import { QUERY_USER } from '../utils/queries'
import Auth  from '../utils/auth'
import decode from 'jwt-decode';
import { QUERY_STOCK } from '../utils/queries'
import { getStockWeights } from '../utils/helpers';
import { SET_STOCK_WEIGHTS } from '../utils/actions';
import { idbPromise } from '../utils/helpers';
import axios from 'axios';



const Home = () => {
    const [decodedToken, setToken] = useState('');
    const dispatch = useDispatch();
    const [stockWeights, setStockWeights] = useState({});

    const CheckStockWeights = useSelector((state) => state.stockWeights);



useEffect(() => {
    const token = localStorage.getItem('id_token');
    if (token) {
      const decoded = decode(token);
      console.log(decoded);
      setToken(decoded);
    } else {
      setToken('');
    }
  }, []);


const { data: userData } = useQuery(QUERY_USER, {
  variables: { username: decodedToken?.data?.username },
  skip: !decodedToken?.data?.username, 
});
const { data: stockData } = useQuery(QUERY_STOCK, {
  variables: { portfolioId: userData?.user?.portfolio_id },
  skip: !userData?.user?.portfolio_id, 
});

useEffect(() => {
  const getStockObject = async () => {
    const data = await stockData;
    const stockObjects = await data.stock;
    const promises = stockObjects.map(async (stockObject) => {
      return {
        [stockObject.stock_symbol]: stockObject.stock_quantity,
      };
    });
    const stockNumbersArray = await Promise.all(promises);
    var stockNumbers = Object.assign({}, ...stockNumbersArray);
    stockNumbers = JSON.stringify(stockNumbers);
    const stockWeights = await getStockWeights(stockNumbers);
    if(stockWeights) {
      try {
        stockWeights['portfolio_id'] = userData.user.portfolio_id;

         idbPromise('stockWeights', 'put', {
          ...stockWeights,
          portfolio_id: stockWeights.portfolio_id
        });
    
        dispatch({
          type: SET_STOCK_WEIGHTS,
          payload: stockWeights,
        });
      } catch (err) {
        console.log(err);
      }
    }
    setStockWeights(stockWeights);
  };

  getStockObject();
}, [stockData, decodedToken]);




    return (
        <div className='container d-flex justify-content-center'>
        <div className='card text-center mt-5 w-50 h-300 '>
            <div className='card-header'>
                <h2> Welcome to iStock Portfolio Creator</h2>
            </div>
            <div className='card-body'>
                <h5 className='card-title'>Create your own portfolio</h5>
                {( 
                    Auth.loggedIn() ? 
                    <>
                    <p className='card-text'>Click on the Add Portfolio button to get started</p>
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
        </div>
    )
}

export default Home