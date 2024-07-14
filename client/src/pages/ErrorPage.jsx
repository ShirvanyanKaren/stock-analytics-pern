import { useState, useEffect } from 'react';
import Header from '../components/Header';
const ErrorPage = ({ errorCode, errorMessage }) => {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <>
        <Header />
            {loading ? (
                <div className='loading d-flex justify-content-center'>
                    <div className='spinner-border' role='status'>
                        <span className='visually-hidden'>Loading...</span>
                    </div>
                </div>
            ) : (
                <div className='error-page text-center'>
                    <div className='card error-container'>
                        <h1 className='error-code text-primary'>{errorCode ? errorCode : '404'}</h1>
                        <p className='error-message'>
                            {errorMessage ? errorMessage : 'Oops! Looks like this is the wrong place.'}
                        </p>
                        <a className='back-link' href='/'>
                            Go back to the homepage
                        </a>
                    </div>
                </div>
            )}
        </>
    );
};

export default ErrorPage;
