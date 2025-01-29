// src/components/Watchlist.jsx
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Modal, Dropdown, DropdownButton } from 'react-bootstrap';
import { fetchWatchlists, handleAddStock, changeWatchlist, handleCreateWatchlist } from '../utils/hooks';
import { addWatchList } from '../services/watchlists';
import { idbPromise } from '../utils/helpers';
import SearchBar from './SearchBar';
import decode from 'jwt-decode';
import defaultStockImage from '../assets/default-stock.jpeg';

const Watchlist = ({ onUpdate }) => {
    const [watchlists, setWatchlists] = useState(['']);
    const [currentWatchlist, setCurrentWatchlist] = useState('');
    const [watchlistStocks, setWatchlistStocks] = useState([]);
    const [watchlistId, setWatchlistId] = useState(null);
    const [show, setShow] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [stockSymbol, setStockSymbol] = useState('');
    const [watchlistName, setWatchlistName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const watchlistState = useSelector((state) => state.watchlist);
    const dispatch = useDispatch();

    useEffect(() => {
        fetchWatchlists(setWatchlists, setCurrentWatchlist, setWatchlistStocks, setWatchlistId, dispatch);
    }, []);

    const handleShow = () => setShow(true);
    const handleShowCreate = () => setShowCreate(true);
    const handleCloseCreate = () => {
        setShowCreate(false);
        setWatchlistName('');
        setError('');
    };
    const handleClose = () => {
        setShow(false);
        setLoading(false);
        setError('');
    };

    // const handleCreateWatchlist = async () => {
    //     try {
            
    //         const newWatchlists = [...watchlists, watchlistName];
    //         setWatchlists(newWatchlists);
    //         const token = localStorage.getItem('id_token');
    //         if (!token) return;
    //         const decoded = decode(token);
    //         const userId = decoded?.data.id;
    //         const res = await addWatchList(userId, watchlistName);
    //         if (res?.status !== 200) throw new Error(res?.response?.data?.message);
    //         idbPromise('watchlist', 'put', {
    //             watchlist: [],
    //             watchlist_name: watchlistName,
    //             watchlist_id: res?.data?.id,
    //         });
    //         handleCloseCreate();
    //     } catch (e) {
    //         console.log(e.message);
    //         setError(e?.message || 'An error occurred');
    //     }
    // };

    const getStockPerformanceColor = (priceChange) => {
        if (priceChange > 0) return 'bg-success';
        if (priceChange < 0) return 'bg-danger';
        return 'bg-neutral';
    };

    return (
        <div className='watchlist'>
            <div className='watchlist-header'>
                <h5>Watch List</h5>
                <DropdownButton
                    id='dropdown-basic-button'
                    title={currentWatchlist}
                    className='m-2'
                    variant='secondary'
                    menuVariant='dark'>
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
            <ul>
                {watchlistStocks.map((stock, index) => (
                    <li key={index} className={getStockPerformanceColor(stock?.priceChange)}>
                        <Link className='w-25' to={`/stocks/${stock?.symbol}`}>
                            <p>{stock?.symbol}</p>
                        </Link>
                        <p>{stock?.price}</p>
                        <p>{stock?.priceChange.toFixed(2)}</p>
                        <p> {stock?.priceChangePercent.toFixed(2)}%</p>
                    </li>
                ))}
            </ul>
            <div className='d-flex flex-direction-row'>
                <Button variant='secondary' onClick={handleShow} className='m-2'>
                    Add Stock
                </Button>
                <Button variant='secondary' onClick={handleShowCreate} className='m-2'>
                    Create Watchlist
                </Button>
            </div>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Stock to Watchlist</Modal.Title>
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
                            {error && <span className='text-danger ms-3'>{error}</span>}
                            <div className='drop-down-custom'>
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
                        <Modal.Footer>
                            <Button variant='secondary' onClick={handleClose}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </>
                )}
            </Modal>

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
                        onSubmit={handleCreateWatchlist}
                    />
                    {error && <span className='text-danger'>{error}</span>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='secondary' onClick={handleCloseCreate}>
                        Close
                    </Button>
                    <Button variant='primary' 
                    onClick={() => handleCreateWatchlist(watchlistName, setWatchlists, watchlists, setError, handleCloseCreate)}
                    >
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Watchlist;
