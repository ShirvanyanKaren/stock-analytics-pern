import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRef } from "react";
import { useSelector } from "react-redux";
import { QUERY_STOCK, QUERY_USER } from "../utils/queries";
import { getFamaFrenchData, getStockWeights, idbPromise, generateChartOptions, } from "../utils/helpers";
import { convertToScientific } from "../utils/format";
import Auth from "../utils/auth";
import decode from "jwt-decode";
import ToolTip from "../components/ToolTip";
import StockDetails from "../components/StockDetails";
import CanvasJSReact from "@canvasjs/react-stockcharts";

const CanvasJS = CanvasJSReact.CanvasJS;
const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const FamaFrench = () => {
  const [dates, setDates] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [mktRf, setMktRf] = useState([]);
  const [smb, setSmb] = useState([]);
  const [hml, setHml] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [stats, setStats] = useState({});

  const endDate = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 0)
  .toISOString()
  .slice(0, 10);

  const startDate = new Date( new Date().getFullYear() - 5, new Date().getMonth() - 1,0)
  .toISOString()
  .slice(0, 10);

  const [graphParams, setGraphParams] = useState({hml: true, smb: true, mktRf: true,});
  useEffect(() => {
    const getFamaFrench = async () => {
      try {
        const weights = await idbPromise("stockWeights", "get");
        let { portfolio_id, ...weightsStorage } = weights[0];
        weightsStorage = JSON.stringify(weightsStorage);
        const response = await getFamaFrenchData(startDate, endDate, weightsStorage);
        const stats = response[1];
        const dataArray = JSON.parse(response[0]);
        console.log(dataArray)
        for(const key in stats){
          setStats((prevStats) => ({
            ...prevStats,
            [key]: convertToScientific(stats[key])
          }));
        }  
        for (const key in dataArray) {
          let MktRf = "Mkt-RF";
          setDates((prevDates) => [...prevDates, key]);
          setPortfolio((prevPortfolio) => [...prevPortfolio, dataArray[key].Portfolio]);
          setMktRf((prevMktRf) => [...prevMktRf, dataArray[key][MktRf]]);
          setSmb((prevSmb) => [...prevSmb, dataArray[key].SMB]);
          setHml((prevHml) => [...prevHml, dataArray[key].HML]);
        }
        setIsLoaded(true);
      } catch (err) {
        console.log(err);
      }
    };
    getFamaFrench();
  }, []);

  const graphSettingsChange = (event) => {
    event.preventDefault();
    setGraphParams({
      ...graphParams,
      [event.target.name]: !graphParams[event.target.name],
    });
  };

 const options = generateChartOptions("famaFrench", {
  dates: dates,
  portfolio: portfolio,
  mktRf: mktRf,
  smb: smb,
  hml: hml,
  graphParams: graphParams,
 });

  return (
    <>
      <div className={isLoaded ? "d-flex justify-content-center" : "d-none"}>
        <div className="card mt-5 col-10">
          <form
            className="col-lg d-flex justify-content-center mb-2"
            ref={graphParams}
            onSubmit={graphSettingsChange}
          >
           {Object.keys(graphParams).slice(0,3).map((key) => (
              <button className="btn btn-outline-dark m-3 mb-3" name={key} onClick={graphSettingsChange}>
                {key.toUpperCase()}
              </button>
            ))}
            <button
              className="btn btn-outline-dark m-3 mb-3"
              onClick={() =>
                setGraphParams({
                  hml: true,
                  smb: true,
                  mktRf: true,
                })
              }
            >
              All Factors
            </button>
          </form>
          <div className="justify-content-center">
            <div className="col-lg d-flex justify-content-center">
              <h4>Expected Yearly Return: {stats['Expected Return']}% </h4>
            </div>

            <div className=" d-flex justify-content-center ">
              <div className="col-10 mb-5">
                <CanvasJSChart options={options} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={isLoaded ? "d-flex justify-content-center" : "d-none"}>
        <StockDetails
          stockStats={stats}
          stockInfo={Boolean(false)}
          name="Fama French Model"
        />
      </div> 
    </>
  );
};

export default FamaFrench;