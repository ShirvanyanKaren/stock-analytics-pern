import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCircleDollarToSlot } from "@fortawesome/free-solid-svg-icons";
import { addStock } from "../services/stocks";
import auth from "../utils/auth";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import decode from "jwt-decode";

const AddPortfolio = ({ stockSymbol, longName, open, page }) => {
  const location = useLocation();
  const [show, setShow] = useState(false);
  
  const [decodedToken, setDecodedToken] = useState(null);
  const [success, setSuccess] = useState(false);
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
    console.log(stockState)
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
    error.message = "";
    setStockState({
      stock_symbol: stockSymbol,
      stock_name: longName,
      stock_quantity: 0,
      stock_purchase_date: new Date().toISOString().slice(0, 10),
      totalAmount: 0,
      portfolio_id: decodedToken?.data?.id,
    });
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
      console.log(data);
      setSuccess(true); 
    } catch (e) {
      error.message = e.message;
      console.error(e);
    }
  };

  const redirectUserLogin = async () => {
    localStorage.removeItem("redirect");
    localStorage.setItem("redirect", location.pathname !== "/login" ? location.pathname : "/");
    window.location.assign("/login");
    console.log(location)
  }

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
            { auth.loggedIn() ? (
              <button type="submit" className="btn btn-primary mt-4 w-100 mb-2">
                Add
                </button>
                ) : (
                  <div className="d-flex justify-content-center">
                    <button type="submit" onClick={redirectUserLogin} className="btn btn-primary mt-4 w-100 mb-2">
                      Login to add
                    </button> 
                  </div>
                )}
          </form>
          {error && <span className="text-danger">{error.message}</span>}
          {success && <span className="text-success">Stock added successfully!</span>}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddPortfolio;
