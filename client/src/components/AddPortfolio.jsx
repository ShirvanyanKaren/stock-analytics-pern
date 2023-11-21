import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useLocation } from "react-router-dom";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const AddPortfolio = (props) => {
  const location = useLocation();
  const [show, setShow] = useState(false);
  const [portfolioName, setPortfolioName] = useState();

  const handleClose = () => setShow(false);

  // stop propagation of event to parent elements
  const handleShow = () => setShow(true);

  const handleSubmit = (event) => {
    event.preventDefault();
    addPortfolio(portfolioName);
    handleClose();
  };


  const stockDetails = props.stockDetails;
  console.log(props.option)

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
          className="add-portfolio-btn"
        >
          <FontAwesomeIcon icon={faPlus} />
        </Button>
      )}



      <Modal show={show} onHide={handleClose} className="add-portfolio-modal">
        <Modal.Header closeButton>
          <Modal.Title>{props.longName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="d-flex justify-content-between">
                <div>
                  <h5>Symbol</h5>
                </div>
                <div>
                  <small className="text-muted">Last Price: ~</small>
                  <small className="text-muted">{(props.open).toFixed(2)}</small>
                </div>
              </div>
              <input
                className="form-control"
                type="text"
                placeholder={stockDetails.stockSymbol}
                name="symbol"
                onChange={(event) => setPortfolioName(event.target.value)}
              ></input>
              <div className="d-flex mt-4">
                <div>
                  <h5>Shares</h5>
                </div>
              </div>
              <input
                className="form-control"
                type="text"
                placeholder="Number of Shares"
                name="shares"
                onChange={(event) => setPortfolioName(event.target.value)}
              ></input>
            </div>
            <button type="submit" className="btn btn-primary mt-4 w-100">
              Add
            </button>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddPortfolio;
