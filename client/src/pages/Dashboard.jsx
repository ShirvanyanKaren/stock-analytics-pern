// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Dropdown, DropdownButton, Button, Modal } from 'react-bootstrap';
import { idbPromise } from '../utils/helpers';
import { fetchWatchlists, handleAddStock, changeWatchlist, handleCreateWatchlist } from '../utils/hooks';
import { getPortfolio } from '../services/portfolios';
import { SET_STOCK_WEIGHTS } from '../utils/actions';
import SearchBar from '../components/SearchBar';
import decode from 'jwt-decode';
import StockCard from '../components/StockCard';
import Auth from '../utils/auth';
import '../styles/Dashboard.scss';

const Dashboard = () => {
    const [user, setUser] = useState(Auth?.getProfile()?.data?.username);
    const CheckStockWeights = useSelector((state) => state.stockWeights);
    const [dashContent, setDashContent] = useState('Watchlist');
    const dashBoardOptions = ['Watchlist', 'Portfolio', 'News'];
    const [watchlists, setWatchlists] = useState(['']);
    const [currentWatchlist, setCurrentWatchlist] = useState('');
    const [watchlistStocks, setWatchlistStocks] = useState([]);
    const [watchlistId, setWatchlistId] = useState(null);
    const watchListState = useSelector((state) => state.watchlist);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [addLoading, setAddLoading] = useState(false);
    const [show, setShow] = useState(false);
    const handleShow = () => setShow(true);
    const dispatch = useDispatch();
    const setDashboardContent = (e) => setDashContent(e.target.value);
    const [showCreate, setShowCreate] = useState(false);
    const handleShowCreate = () => setShowCreate(true);
    const handleCloseCreate = () => {
        setShowCreate(false);
        setWatchlistName('');
        setError('');
    };
  
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
    
    const [watchlistName, setWatchlistName] = useState('');
    const handleClose = () => {
        setShow(false);
        setError('');
    };

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            await fetchWatchlists(setWatchlists, setCurrentWatchlist, setWatchlistStocks, setWatchlistId, dispatch);
            setLoading(false);
        };
        fetchItems();
    }, []);

    return (
        <div className='dashboard'>
            <div className='dashboard-header d-flex justify-content-center'>
                <h2>{user}'s Dashboard</h2>
            </div>
            <div className='dashboard-options d-flex justify-content-around'>
                {dashBoardOptions.map((option, index) => (
                    <button
                        key={index}
                        value={option}
                        className={dashContent === option ? 'btn active' : 'btn'}
                        onClick={setDashboardContent}>
                        {option}
                    </button>
                ))}
            </div>
            {dashContent === 'Watchlist' && [
                loading ? (
                    <div className='d-flex justify-content-center'>
                        <div className='spinner-border' role='status'>
                            <span className='visually-hidden'>Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div className='watchlist-content'>
                        <div className='d-flex m-2 flex-direction-row justify-content-center'>
                            <div className='m-1'>
                                <DropdownButton id='dropdown-basic-button' title={currentWatchlist}>
                                    {watchlists.map((watchlist, index) => (
                                        <Dropdown.Item
                                            key={index}
                                            onClick={(e) =>
                                                changeWatchlist(
                                                    e.target.innerText,
                                                    setWatchlistStocks,
                                                    setWatchlistId,
                                                    setCurrentWatchlist,
                                                    dispatch,
                                                )
                                            }>
                                            {watchlist}
                                        </Dropdown.Item>
                                    ))}
                                </DropdownButton>
                            </div>
                            <div className='m-1'>
                                <Button variant='primary' onClick={handleShow}>
                                    Add Stock
                                </Button>
                            </div>
                            <div className='m-1'>
                                <Button variant='primary' onClick={handleShowCreate}>
                                    Create Watchlist
                                </Button>
                            </div>
                        </div>
                        <Modal show={show} onHide={handleClose}>
                            <Modal.Header
                                closeButton={true}
                                className='d-flex justify-content-center flex-direction-column'>
                                <Modal.Title className='text-center w-100'>Add Stock to Watchlist</Modal.Title>
                            </Modal.Header>
                            {addLoading ? (
                                <div className='d-flex justify-content-center'>
                                    <div className='spinner-border' role='status'>
                                        <span className='visually-hidden'>Loading...</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Modal.Body>
                                        <div className='d-flex justify-content-center'>
                                            {error && <span className='text-danger me-4 text-center'>{error}</span>}
                                        </div>
                                        <div className='drop-down-custom d-flex justify-content-center'>
                                            <SearchBar
                                                onSubmit={(e) => e.preventDefault()}
                                                handleAddStock={(stock) =>
                                                    handleAddStock(
                                                        watchlistId,
                                                        stock,
                                                        setAddLoading,
                                                        setWatchlistStocks,
                                                        dispatch,
                                                        handleClose,
                                                        setError,
                                                        watchlistStocks,
                                                        currentWatchlist,
                                                    )
                                                }
                                                watchlist={true}
                                                watchlistId={watchlistId}
                                            />
                                        </div>
                                    </Modal.Body>
                                </>
                            )}
                        </Modal>
                        <div className='watchlist-cards m-2 d-flex justify-content-center'>
                            {watchlistStocks.map((stock, index) => (
                                <StockCard key={index}
                                 stock={stock} 
                                 currentWatchlist={currentWatchlist}
                                
                                />
                            ))}
                        </div>
                        <Modal show={showCreate} onHide={handleCloseCreate}>
                            <Modal.Header closeButton>
                                <Modal.Title>Create Watchlist</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <input
                                    type='text'
                                    className='form-control'
                                    placeholder='Watchlist Name'
                                    value={watchlistName}
                                    onChange={(e) => setWatchlistName(e.target.value)}
                                    onSubmit={(e) => e.preventDefault()}
                                />
                                {error && <span className='text-danger'>{error}</span>}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant='secondary' onClick={handleCloseCreate}>
                                    Close
                                </Button>
                                <Button variant='primary' 
                                onClick={() => handleCreateWatchlist(watchlistName, setWatchlists, watchlists, setError, handleCloseCreate, setCurrentWatchlist)}>
                                    Create
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </div>
                ),
            ]}
        </div>
    );
};

export default Dashboard;
