import AddPortfolio from "./AddPortfolio";




const formatNum = (num) => {
    if (num > 1000000000) {
        return (num / 1000000000).toFixed(2) + ' B';
    } else if (num > 1000000) {
        return (num / 1000000).toFixed(2) + ' M';
    } else if (num > 1000) {
        return (num / 1000).toFixed(2) + ' K';
    } else {
        return num;
    }
}

const StockDetails = (props) => {

    console.log(props.sharesOutstanding)
        return (
            <div className="container mt-5">
            <div className="row card custom-card">
            <div className="card-header">
            <h3 className="text-left ms-2">{props.longName} Financial Overview</h3>
            </div>
                <div className="col-12 card-items-custom d-flex">

                    <ul className="list-group list-group-flush col-6">

                        <li className="list-group-item">Previous Close: <span className="float-end fw-bold">{props.previousClose}</span></li>
                        <li className="list-group-item">Volume: <span className="float-end fw-bold">{formatNum(props.volume)}</span></li>
                        <li className="list-group-item">Low: <span className="float-end fw-bold">{props.low}</span></li>
                        <li className="list-group-item">52 Week High: <span className="float-end fw-bold">{props.week52High}</span></li>
                        <li className="list-group-item">Market Cap: <span className="float-end fw-bold">{formatNum(props.marketCap)}</span></li>
                        <li className="list-group-item">Shares Outstanding: <span className="float-end fw-bold">{formatNum(props.sharesOutstanding)}</span></li>
                        <li className="list-group-item">Beta: <span className="float-end fw-bold">{props.beta}</span></li>
                    </ul>
                    <ul className="list-group list-group-flush col-6">
                        <li className="list-group-item">Open: <span className="float-end fw-bold">{props.open}</span></li>
                        <li className="list-group-item">High: <span className="float-end fw-bold">{props.high}</span></li>
                        <li className="list-group-item">Forward PE: <span className="float-end fw-bold">{props.forwardPE}</span></li>
                        <li className="list-group-item">52 Week Low: <span className="float-end fw-bold">{props.week52Low}</span></li>
                        <li className="list-group-item">Dividend Rate: <span className="float-end fw-bold">{props.dividendRate}</span></li>
                        <li className="list-group-item">Dividend Yield: <span className="float-end fw-bold">{props.dividendYield}</span></li>
                    </ul>
                </div>
                <form>
                <AddPortfolio 
                stockDetails={props}
                page={Boolean(true)}
                longName={props.longName}
                open={props.open}
                />
                </form>
 

            </div>
        </div>
        )
    }

export default StockDetails;