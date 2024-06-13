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
import { getStockWeights, getStockObject } from '../utils/helpers';
import { SET_STOCK_WEIGHTS } from '../utils/actions';
import { idbPromise } from '../utils/helpers';
import axios from 'axios';


const Home = () => {
const [decodedToken, setToken] = useState('');
const dispatch = useDispatch();
const [stockWeights, setStockWeights] = useState({});
const [loading, setLoading] = useState(true);

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
  variables: { portfolioId: userData?.user?.id },
  skip: !userData?.user?.id, 
});
useEffect(() => {
  idbPromise('stockWeights', 'get').then(result => result.length === 0 ? setLoading(true) : setLoading(false));
}, [stockWeights]);

useEffect(() => {
  getStockObject(userData, stockData, dispatch, setStockWeights)
}, [userData, stockData]);


    return (
        <div className='container d-flex justify-content-center'>
          { loading && userData && Auth.loggedIn()? (
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