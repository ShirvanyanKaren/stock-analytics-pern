import React from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { QUERY_ME } from '../utils/queries'
import { useStoreContext } from '../utils/GlobalState'
import {useDispatch, useSelector} from "react-redux";
import { QUERY_USER } from '../utils/queries'
import Auth  from '../utils/auth'
import decode from 'jwt-decode';



const Home = () => {
    const [decodedToken, setToken] = useState('');
    const dispatch = useDispatch();


    useEffect(() => {
        const token = localStorage.getItem('id_token');
        if (token) {
          const decoded = decode(token);
          setToken(decoded);
        } else {
          setToken('');
        }
      }, []);

      const { data: userData } = useQuery(QUERY_USER, {
        variables: { username: decodedToken?.data?.username },
        skip: !decodedToken?.data?.username, 
      });
    
      if (userData) {
      console.log(userData);
      }





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