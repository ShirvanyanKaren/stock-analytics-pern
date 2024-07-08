// ErrorPage renders an error message and a link to the homepage if the user navigates to a page that doesn't exist.
const ErrorPage = ({ errorCode, errorMessage }) => {
    return (
        <div className='error-page text-center'>
            <div className='card error-container'>
                <h1 className='error-code'>{errorCode}</h1>
                <p className='error-message'>
                    {errorMessage ? errorMessage : 'Oops! Looks like this is the wrong place.'}
                </p>
                <a className='back-link' href='/'>
                    Go back to the homepage
                </a>
            </div>
        </div>
    );
};

export default ErrorPage;
