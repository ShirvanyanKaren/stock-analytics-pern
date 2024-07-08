import PropTypes from 'prop-types';
import '../styles/StockCard.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowAltCircleDown, faArrowDownShortWide } from '@fortawesome/free-solid-svg-icons';
import { formatNumber } from '../utils/format';

const StockCard = ({ stock }) => {
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
        <button className='btn btn-light'>Show more info 
          <span className='ms-1'> <FontAwesomeIcon icon={faArrowDownShortWide} /></span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default StockCard;
