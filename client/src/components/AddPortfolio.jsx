import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCircleDollarToSlot } from "@fortawesome/free-solid-svg-icons";
import { useMutation, useQuery } from "@apollo/client";
import { ADD_STOCK } from "../utils/mutations";
import { QUERY_USER } from "../utils/queries";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import decode from "jwt-decode";

const AddPortfolio = ({ stockSymbol, longName, open, page }) => {
  const location = useLocation();
  const [show, setShow] = useState(false);
  const [decodedToken, setDecodedToken] = useState(null);
  const [success, setSuccess] = useState(false);
  const [stockState, setStockState] = useState({
    symbol: stockSymbol,
    stock_name: longName,
    shares: 0,
    purchase_date: new Date().toISOString().slice(0, 10),
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
        symbol: stockSymbol,
        stock_name: longName,
      }));
    }
  }, [stockSymbol, longName]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    const shares = name === "shares" ? Math.max(0, parseInt(value, 10)) : value;
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
    setStockState({
      symbol: stockSymbol,
      stock_name: longName,
      shares: 0,
      purchase_date: new Date().toISOString().slice(0, 10),
      totalAmount: 0,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log("clicked")
    if (!stockState.shares) return;

    try {
      const mutation = await addStock({
        variables: {
          portfolioId: userData.user.id,
          stockQuantity: stockState.shares,
          stockPurchaseDate: stockState.purchase_date,
          stockName: stockState.stock_name,
          stockSymbol: stockState.symbol,
        },
      });
      console.log(mutation);
      setSuccess(true);
    } catch (e) {
      console.error(e);
    }
  };

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
                name="shares"
                value={stockState.shares}
                onChange={(e) => setStockState({ ...stockState, shares: e.target.value })}
              />
              <label className="text-muted mt-3 f-4">
                Total Investment: ${isNaN(stockState.totalAmount) ? 0 : stockState.totalAmount}
              </label>
            </div>
            <button type="submit" className="btn btn-primary mt-4 w-100 mb-2">
              Add
            </button>
          </form>
          {error && <span className="text-danger">Something went wrong!</span>}
          {success && <span className="text-success">Stock added successfully!</span>}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddPortfolio;
