import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCircleDollarToSlot } from "@fortawesome/free-solid-svg-icons";
import { useMutation, useQuery } from "@apollo/client";
import { ADD_STOCK } from "../utils/mutations";
import { QUERY_USER } from "../utils/queries";
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
    stockSymbol: stockSymbol,
    stockName: longName,
    stockQuantity: 0,
    stockPurchaseDate: new Date().toISOString().slice(0, 10),
    totalAmount: 0,
  });

  const [addStock, { error }] = useMutation(ADD_STOCK);

  useEffect(() => {
    const token = localStorage.getItem("id_token");
    if (token) {
      setDecodedToken(decode(token));
    }
  }, []);

  const { data: userData } = useQuery(QUERY_USER, {
    variables: { username: decodedToken?.data?.username },
    skip: !decodedToken?.data?.username,
  });

  useEffect(() => {
    if (stockSymbol && longName) {
      setStockState((prevState) => ({
        ...prevState,
        stockSymbol: stockSymbol,
        stockName: longName,
      }));
    }
  }, [stockSymbol, longName]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    const shares = name === "stockQuantity" ? Math.max(0, parseInt(value, 10)) : value;
    console.log(typeof shares)
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
      stockSymbol: stockSymbol,
      stockName: longName,
      stockQuantity: 0,
      stockPurchaseDate: new Date().toISOString().slice(0, 10),
      totalAmount: 0,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!stockState.stockQuantity || !userData) return;
    try {
      console.log(typeof stockState.stockQuantity)
      const mutation = await addStock({
        variables: {
          portfolioId: userData.user.id,
          ...stockState,
        },
      });
      setSuccess(true);
    } catch (e) {
      error.message = e.message;
      console.error(e);
    }
  };

  const redirectUserLogin = async () => {
    localStorage.removeItem("redirect");
    localStorage.setItem("redirect", location.pathname);
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
        <Button variant="primary" onClick={handleShow} className="add-portfolio-btn ms-2 end-0">
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
                name="stockQuantity"
                value={stockState.stockQuantity}
                onChange={(e) => setStockState({ ...stockState, stockQuantity: Number(e.target.value) })}
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
