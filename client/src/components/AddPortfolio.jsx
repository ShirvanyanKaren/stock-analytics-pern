import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useLocation } from "react-router-dom";
import { faPlus, faCircleDollarToSlot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { stockSearch } from "../utils/helpers";
import defaultStockImage from "../assets/default-stock.jpeg";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import SearchBar from "./SearchBar";



const AddPortfolio = (props) => {
  const location = useLocation();
  const [show, setShow] = useState(false);
  const [portfolioName, setPortfolioName] = useState();
  const [totalAmount, setTotalAmount] = useState();
  const [options, setOptions] = useState([]);

  const handleClose = () => setShow(false);


  const [stockState, setStockState] = useState({
    symbol: props.stockSymbol,
    shares: 0,
    totalAmount: 0
});



const handleInputChange = (event) => {
    const { name, value } = event.target;


    const shares = name === 'shares' ? Math.max(0, parseInt(value, 10)) : value;

    setStockState((prevState) => ({
      ...prevState,
      [name]: shares,
      totalAmount: (shares * props.open).toFixed(2),
    }));




  };


  console.log(stockState.totalAmount)




  const handleShow = () => setShow(true);

  const handleSubmit = (event) => {
    event.preventDefault();
    addPortfolio(portfolioName);
    handleClose();
  };


  const stockDetails = props.stockDetails;
  console.log(props)

  return (
    <> 
      {props.page ? (
        <Button variant="primary" className="m-2" onClick={handleShow}>
          Add Portfolio
        </Button>
      ) : (
        <Button
          variant="primary"
          onClick={handleShow}
          className="add-portfolio-btn ms-2 end-0"
        >
          <FontAwesomeIcon icon={faCircleDollarToSlot} />
        </Button>
      )}



      <Modal show={show} onHide={handleClose} className="add-portfolio-modal">
        <Modal.Header closeButton>
          <Modal.Title>{props.longName}</Modal.Title>
          
        </Modal.Header>
 
        <Modal.Body>
          <form onSubmit={handleSubmit} useref={stockState} onChange={handleInputChange} >
            <div className="form-group">

              <div className="d-flex justify-content-between">
                <div>
                  <h5>Symbol: {props.stockSymbol}</h5>
                </div>
                <div>
                  <small className="text-muted">Last Price: ~</small>
                  <small className="text-muted">{(props.open).toFixed(2)}</small>
                </div>
              </div>

                
              <div className="d-flex mt-4">
                <div>
                  <h5>Shares</h5>
                </div>
              </div>
              <input
                className="form-control"
                type="number"
                placeholder="Number of Shares"
                name="shares"
                value={stockState.shares}
                onChange={(e) => setStockState({ ...stockState, shares: e.target.value })}
              ></input>
 
            <label className="text-muted mt-3 f-4" value="totalAmount"> Total Investment: ${
            (stockState.totalAmount) === "NaN" ?  0 : stockState.totalAmount}</label>
            </div>
            <button type="submit" className="btn btn-primary mt-4 w-100">
              Add
            </button>

          </form>
        </Modal.Body>
        <Modal.Footer >
        <SearchBar
                fromPortfolio={Boolean(true)}
                stockDetails={stockDetails}
                onClick={handleClose}
                />
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddPortfolio;
