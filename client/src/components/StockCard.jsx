import PropTypes from 'prop-types';
import '../styles/StockCard.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowAltCircleDown, faArrowDownShortWide } from '@fortawesome/free-solid-svg-icons';
import { formatNumber, titleCase } from '../utils/format';
import { Modal } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import Auth from '../utils/auth';





const StockCard = ({ stock }) => {
  const [showWatchlistDetails, setShowWatchlistDetails] = useState(false);
  console.log(stock, 'stock')

  const stockMetrics = () => {
    return (
      <>
      {Object.keys(stock.metrics.ratios).length > 0 && (
        <div className='mt-3'> 
          <h6>Ratios</h6>
          {Object.keys(stock.metrics.ratios).map((key, i) => {
            return (
              <p key={i}>{titleCase(key)}: {stock.metrics.ratios[key]}</p>
            )
          }
          )}
        </div>
      )}
        {Object.keys(stock.metrics.financials).length > 0 && (
          <div className='mt-3'>
            <h6>Financials</h6>
            {Object.keys(stock.metrics.financials).map((key, i) => {
              return (
                <p key={i}>{titleCase(key)}: {stock.metrics.financials[key]}</p>
              )
            }
            )}
          </div>
        )}
        {Object.keys(stock.metrics.stockPerformance).length > 0 && (
          <div className='mt-3'>
            <h6>Stock Performance</h6>
            {Object.keys(stock.metrics.stockPerformance).map((key, i) => {
              return (
                <p key={i}>{titleCase(key)}: {stock.metrics.stockPerformance[key]}</p>
              )
            }
            )}
          </div>
        )}

      </>
    )
  }
  return (
    <div className='card s-card'>
      <div className='card-content'>
        <div className='company-container text-center'> 
        <div className='ticker-name'>
          <h6>{stock.symbol}</h6>
        </div>
        <div className='company-logo'>
            <img src={`https://financialmodelingprep.com/image-stock/${stock.symbol}.png`} alt={stock.symbol} />
          </div>
        </div>
        <div className='stock-info'>
          <div>
            <h6>Metrics</h6>
            <p
            >Price: {stock.price}</p>
            <p
            >Day Change:&nbsp;
            <span className={stock.priceChange > 0 ? 'text-success' : 'text-danger'}>
            {formatNumber(stock.priceChange, 2)}%</span>
            </p>
            <p
            > After Hours Price: {formatNumber(stock.afterHoursPrice, 2)}
            </p>
            <p
            >After Hours Change:&nbsp;
            <span className={stock.afterHoursChange > 0 ? 'text-success' : 'text-danger'}>
            {formatNumber(stock.afterHoursChange, 3)}%
            </span>
            </p>
          </div>
        </div>
      </div>
      <div>
        <div className='d-flex justify-content-center'> 
        <button className
        ='btn btn-light'
        onClick={() => setShowWatchlistDetails(true)}
        >Show more info 
        
          <span className='ms-1'> <FontAwesomeIcon icon={faArrowDownShortWide} /></span>
          </button>
        </div>
      </div>
      <Modal show={showWatchlistDetails} onHide={() => setShowWatchlistDetails(false)}>
        <Modal.Header 
        className='d-flex justify-content-center'
        closeButton
        >
          <Modal.Title>Metrics</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {stockMetrics()}
        </Modal.Body>
        <Modal.Footer>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
export default StockCard;
