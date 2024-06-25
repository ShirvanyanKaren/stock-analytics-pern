import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCircleDollarToSlot } from "@fortawesome/free-solid-svg-icons";
import { addStock, addToWatchlist, createWatchlist } from "../utils/helpers"; // Updated import
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import decode from "jwt-decode";

const AddPortfolio = ({ stockSymbol, longName, open, page }) => {
  const location = useLocation();
  const [show, setShow] = useState(false);
  
  const [decodedToken, setDecodedToken] = useState(null);
  const [success, setSuccess] = useState(false);
  const [watchlistSuccess, setWatchlistSuccess] = useState(false);
  const [watchlistName, setWatchlistName] = useState("");
  const [stockState, setStockState] = useState({
    stock_symbol: stockSymbol,
    stock_name: longName,
    stock_quantity: 0,
    stock_purchase_date: new Date().toISOString().slice(0, 10),
    totalAmount: 0,
    portfolio_id: null,
  });

  const error = { message: "" };

  useEffect(() => {
    const token = localStorage.getItem("id_token");
    if (token) {
      const decoded = decode(token);
      setDecodedToken(decoded);
      setStockState((prevState) => ({
        ...prevState,
        portfolio_id: decoded?.data?.id,
      }));  
    }
  }, []);

  useEffect(() => {
    if (stockSymbol && longName) {
      setStockState((prevState) => ({
        ...prevState,
        stock_symbol: stockSymbol,
        stock_name: longName,
      }));
    }
  }, [stockSymbol, longName]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    const shares = name === "stock_quantity" ? Math.max(0, parseInt(value, 10)) : value;
    setStockState((prevState) => ({
      ...prevState,
      [name]: shares,
      totalAmount: (shares * open).toFixed(2),
    }));
  };

  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    setSuccess(false);
    setWatchlistSuccess(false);
    error.message = "";
    setStockState({
      stock_symbol: stockSymbol,
      stock_name: longName,
      stock_quantity: 0,
      stock_purchase_date: new Date().toISOString().slice(0, 10),
      totalAmount: 0,
      portfolio_id: decodedToken?.data?.id,
    });
    setWatchlistName("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!stockState.portfolio_id || !stockState.stock_symbol || !stockState.stock_name) {
      error.message = "Please provide all required information.";
      return;
    }
    try {
      const { data } = await addStock(stockState);
      setSuccess(true); 
    } catch (e) {
      error.message = e.message;
    }
  };

  const handleAddToWatchlist = async () => {
    if (!stockState.stock_symbol) {
      error.message = "Please provide all required information.";
      return;
    }
    try {
      const { data } = await addToWatchlist(stockState.stock_symbol, decodedToken?.data?.id);
      setWatchlistSuccess(true);
    } catch (e) {
      error.message = e.message;
    }
  };

  const handleCreateWatchlist = async () => {
    if (!watchlistName) {
      error.message = "Please provide a watchlist name.";
      return;
    }
    try {
      const { data } = await createWatchlist(watchlistName, decodedToken?.data?.id);
      setWatchlistSuccess(true);
    } catch (e) {
      error.message = e.message;
    }
  };

  return (
    <>
      {page ? (
        <Button variant="primary" className="m-2" onClick={handleShow}>
          Add Portfolio
        </Button>
      ) : (
        <Button variant="primary" onClick={handleShow} className="add-portfolio-btn d-flex justify-content-center">
          <FontAwesomeIcon icon={faCircleDollarToSlot} />
        </Button>
      )}

      <Modal show={show} onHide={handleClose} className="add-portfolio-modal">
        <Modal.Header closeButton>
          <Modal.Title>{longName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} onChange={handleInputChange}>
            <div className="form-group">
              <div className="d-flex justify-content-between">
                <h5>Symbol: {stockSymbol}</h5>
                <small className="text-muted">Last Price: ~{open.toFixed(2)}</small>
              </div>
              <div className="d-flex mt-4">
                <h5>Shares</h5>
              </div>
              <input
                className="form-control"
                type="number"
                placeholder="Number of Shares"
                name="stock_quantity"
                value={stockState.stock_quantity}
                onChange={(e) => setStockState({ ...stockState, stock_quantity: Number(e.target.value) })}
              />
              <label className="text-muted mt-3 f-4">
                Total Investment: ${isNaN(stockState.totalAmount) ? 0 : stockState.totalAmount}
              </label>
            </div>
            <button type="submit" className="btn btn-primary mt-4 w-100 mb-2">
              Add
            </button>
          </form>
          {error && <span className="text-danger">{error.message}</span>}
          {success && <span className="text-success">Stock added successfully!</span>}
          {watchlistSuccess && <span className="text-success">Operation successful!</span>}
          <div className="d-flex flex-column mt-3">
            <Button variant="secondary" className="mb-2" onClick={handleAddToWatchlist}>
              Add to Watchlist
            </Button>
            <div className="d-flex">
              <input
                className="form-control"
                type="text"
                placeholder="Watchlist Name"
                value={watchlistName}
                onChange={(e) => setWatchlistName(e.target.value)}
              />
              <Button variant="secondary" className="ms-2" onClick={handleCreateWatchlist}>
                Create Watchlist
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddPortfolio;
