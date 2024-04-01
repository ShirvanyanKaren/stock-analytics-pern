import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useLocation } from "react-router-dom";
import { faPlus, faCircleDollarToSlot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {ADD_STOCK} from "../utils/mutations";
import { useMutation } from "@apollo/client";
import { QUERY_USER } from "../utils/queries";
import { useQuery } from "@apollo/client";
import decode from "jwt-decode";



const AddPortfolio = (props) => {
  const location = useLocation();
  const [show, setShow] = useState(false);
  const [decodedToken, setToken] = useState('');
  const [totalAmount, setTotalAmount] = useState();
  const [options, setOptions] = useState([]);
  const [success, setSuccess] = useState(false);

  const handleClose = () => {
    setShow(false);
    setSuccess(false);
    setStockState({
      symbol: props.stockSymbol,
      stock_name: props.longName,
      shares: 0,
      purchase_date: new Date().toISOString().slice(0, 10),
      totalAmount: 0
    });
  }

  const [addStock, { error }] = useMutation(ADD_STOCK);

  useEffect(() => {
    const token = localStorage.getItem('id_token');
    if (token) {
      const decoded = decode(token);
      setToken(decoded);
    } else {
      setToken('');
    }
  }, []);

  const { data: userData } = useQuery(QUERY_USER, {
    variables: { username: decodedToken?.data?.username },
    skip: !decodedToken?.data?.username, 
  });

  if (userData) {
  console.log(userData);
  }


  const [stockState, setStockState] = useState({});

  useEffect(() => {
    setSuccess(false);
    if (props.stockSymbol) {
      setStockState({
        symbol: props.stockSymbol,
        stock_name: props.longName,
        shares: 0,
        purchase_date: new Date().toISOString().slice(0, 10),
        totalAmount: 0
      });
    }
    }, [props.stockSymbol, props.longName] );




const handleInputChange = (event) => {
    const { name, value } = event.target;

    const shares = name === 'shares' ? Math.max(0, parseInt(value, 10)) : value;
    setStockState((prevState) => ({
      ...prevState,
      [name]: shares,
      totalAmount: (shares * props.open).toFixed(2),
    }));

  };







  const handleShow = () => setShow(true);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
    if (stockState.shares) {
    
      const mutation = await addStock({
        variables: {
          portfolioId: userData.user.id,
          stockQuantity: stockState.shares,
          stockPurchaseDate: stockState.purchase_date,
          stockName: stockState.stock_name,
          stockSymbol: stockState.symbol
        },
      });

      console.log(mutation);
      setSuccess(true);

    }
  } catch (e) {
    console.log(e);
  };
  };

  console.log("portfolio id", userData?.user.id)




  const stockDetails = props.stockDetails;


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
            <button type="submit" className="btn btn-primary mt-4 w-100 mb-2">
              Add
            </button>

          </form>
          <span className="text-danger">{error && "Something went wrong!"}</span>
          <span className="text-success">{success && "Stock added successfully!"}</span>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddPortfolio;
