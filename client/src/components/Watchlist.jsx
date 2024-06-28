import { useState, useEffect } from "react";
import { stockWatchlistSearch, getStockOverview } from "../utils/helpers";
import {useSelector, useDispatch} from "react-redux";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp, faSearch } from "@fortawesome/free-solid-svg-icons";
import { Button, Modal, Dropdown, DropdownButton } from "react-bootstrap";
import { addWatchList, getWatchlists, addStockToWatchList, deleteStockFromWatchList } from "../services/watchlists";
import { idbPromise } from "../utils/helpers";
import SearchBar from "./SearchBar";
// import "../styles/Watchlist.scss";
import decode from "jwt-decode";
import defaultStockImage from "../assets/default-stock.jpeg";

const Watchlist = ({ onUpdate }) => {
  const [watchlists, setWatchlists] = useState([""]);
  const [currentWatchlist, setCurrentWatchlist] = useState("");
  const [watchlistStocks, setWatchlistStocks] = useState([]);
  const [watchlistId, setWatchlistId] = useState(null);
  const [show, setShow] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [stockSymbol, setStockSymbol] = useState("");
  const [watchlistName, setWatchlistName] = useState("");
  const [error, setError] = useState("");
  const watchlistState = useSelector((state) => state.watchlist);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchWatchlists = async () => {
      const checkForWatchLists = await idbPromise("watchlist", "get");
      let watchListObjects = {};
      let currentName, watchlistNames, watchlistId;
      if (checkForWatchLists.length > 0) {
        watchlistNames = checkForWatchLists.map(watchlist => watchlist.watchlist_name);
        currentName = watchlistNames[0];
        watchlistId = checkForWatchLists[0].watchlist_id;
        for (let i = 0; i < watchlistNames.length; i++) {
          const watchListItems = checkForWatchLists[i].watchlist;
          watchListObjects[watchlistNames[i]] = watchListItems;
        }
      } else {
        const token = localStorage.getItem("id_token");
        if (!token) return;
        const decoded = decode(token);
        const userId = decoded?.data.id;
        const userWatchlists = await getWatchlists(userId);
        watchlistNames = Object.keys(userWatchlists);
        currentName = watchlistNames[0];
        watchlistId = userWatchlists[currentName].id;
        for (let i = 0; i < watchlistNames.length; i++) {
          const watchListItems = userWatchlists[watchlistNames[i]].watches;
          const watchListArray = watchListItems.length ? await getStockOverview(watchListItems) : [];
          watchListObjects[watchlistNames[i]] = watchListArray; 
          idbPromise("watchlist", "put", { watchlist: watchListArray, watchlist_name: watchlistNames[i], watchlist_id: userWatchlists[watchlistNames[i]].id });
        }
      }
      setWatchlistId(watchlistId);
      setWatchlists(watchlistNames);
      setCurrentWatchlist(currentName);
      setWatchlistStocks(watchListObjects[currentName]);
      dispatch({
        type: "SET_WATCHLIST",
        watchlist: watchListObjects[currentName]
      });
    };

    fetchWatchlists();
  }, []);

  const handleShow = () => setShow(true);

  const handleShowCreate = () => setShowCreate(true);

  const handleCloseCreate = () => {
    setShowCreate(false);
    setWatchlistName("");
    setError("");
  };

  const handleClose = () => {
    setShow(false);
    setLoading(false);
    setError("");
  };

  const handleCreateWatchlist = async () => {
    try {
      const newWatchlists = [...watchlists, watchlistName];
      setWatchlists(newWatchlists);
      const token = localStorage.getItem("id_token");
      if (!token) return;
      const decoded = decode(token);
      const userId = decoded?.data.id;
      const res = await addWatchList(userId, watchlistName);
      console.log("res", res?.status);
      if(res?.status !== 200) throw new Error(res?.response?.data?.message);
      idbPromise("watchlist", "put", { watchlist: [], watchlist_name: watchlistName, watchlist_id: res?.data?.id});
      handleCloseCreate();
    } catch (e) {
      console.log(e.message);
      setError(e.message);
    }
  };

  const changeWatchlist = async (watchlist) => {
    setCurrentWatchlist(watchlist);
    const watchlistData = await idbPromise("watchlist", "get");
    const thisWatchlist = watchlistData.find((watchlistItem) => watchlistItem.watchlist_name === watchlist);
    const thisId = thisWatchlist.watchlist_id;
    console.log("thisId", thisId);
    setWatchlistId(thisId);
    console.log("thisWatchlist", thisWatchlist);
    setWatchlistStocks(thisWatchlist.watchlist);
    dispatch({
      type: "SET_WATCHLIST",
      watchlist: thisWatchlist.watchlist
    });
     console.log("watchlistStocks", watchlistState);
  }

  const handleAddStock = async (stock) => {
    try {
      const res = await addStockToWatchList(watchlistId, stock);
      console.log("res", res);
      console.log(res.response);
      setLoading(true);
      console.log("loading...", loading);
      if(res?.status !== 200) throw new Error(res?.response?.data?.message);
      const newStock = await getStockOverview([stock]);
      if (newStock.length === 0) throw new Error("Stock not found");
      const updatedWatchlist = [...watchlistStocks, newStock[0]];
      setWatchlistStocks(updatedWatchlist);
      dispatch({
        type: "SET_WATCHLIST",
        watchlist: updatedWatchlist
      });
      idbPromise("watchlist", "put", { watchlist: updatedWatchlist, watchlist_name: currentWatchlist, watchlist_id: watchlistId });
      handleClose();
      setLoading(false);
    } catch (e) {
      console.log(e.message);
      setLoading(false);
      setError(e.message);
    }
  };

  const getStockPerformanceColor = (stock) => {
    if (stock < 0) return "bg-danger";
    else if (stock > 0) return "bg-success";
    else return "bg-neutral";
  };
   

  return (
    <div className="watchlist">
      <div className="watchlist-header">
        <h5>Watch List</h5>
        <DropdownButton
          id="dropdown-basic-button"
          title={currentWatchlist}
          classnName="m-2 "
          variant="secondary"
          menuVariant="dark"
        >
          {watchlists.map((watchlist, index) => (
            <Dropdown.Item
              key={index}
              onClick={(e) => changeWatchlist(watchlist)}
            >
              {watchlist}
            </Dropdown.Item>
          ))}
        </DropdownButton>
      </div>
      <ul>
        {watchlistStocks.map((stock, index) => (
          <li
            key={index}
            className={getStockPerformanceColor(stock?.priceChange)}
          >
            <Link to={`/stocks/${stock?.symbol}`}>
              <p>{stock?.symbol}</p>
            </Link>
            <p>{stock?.price}</p>
            <p>{stock?.priceChange.toFixed(2)}</p>{" "}
            <p> {stock?.priceChangePercent.toFixed(2)}%</p>
          </li>
        ))}
      </ul>
      <div className="d-flex flex-direction-row">
        <Button variant="secondary" onClick={handleShow} className="m-2">
          Add Stock
        </Button>
        <Button variant="secondary" onClick={handleShowCreate} className="m-2">
          Create Watchlist
        </Button>
      </div>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Stock to Watchlist</Modal.Title>
        </Modal.Header>
        {loading ? (
          <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            <Modal.Body>
              {error && <span className="text-danger ms-3">{error}</span>}
              <div className="drop-down-custom">
                <SearchBar
                  onSubmit={(e) => e.preventDefault()}
                  handleAddStock={handleAddStock}
                  watchlist={true}
                  watchlistId={watchlistId}
                />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
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
            type="text"
            className="form-control"
            placeholder="Watchlist Name"
            value={watchlistName}
            onChange={(e) => setWatchlistName(e.target.value)}
            onSubmit={handleCreateWatchlist}
          />
          {error && <span className="text-danger">{error}</span>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCreate}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreateWatchlist}>
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );  
};

export default Watchlist;
