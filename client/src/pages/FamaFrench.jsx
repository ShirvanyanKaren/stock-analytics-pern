import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CanvasJSReact from "@canvasjs/react-stockcharts";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import ToolTip from "../components/ToolTip";

import StockDetails from "../components/StockDetails";
import { useSelector } from "react-redux";
import { QUERY_USER } from '../utils/queries'
import Auth  from '../utils/auth'
import decode from 'jwt-decode';
import { idbPromise } from "../utils/helpers";
import { QUERY_STOCK } from '../utils/queries'
import { getStockWeights } from '../utils/helpers';

import axios from "axios";





const CanvasJS = CanvasJSReact.CanvasJS;

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

// const port = process.env.PORT || 8000;

const FamaFrench = () => {
  const [dates, setDates] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [mktRf, setMktRf] = useState([]);
  const [smb, setSmb] = useState([]);
  const [hml, setHml] = useState([]);
  const stockWeights = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [stats, setStats] = useState({
    sharpe: 0,
    beta: 0,
    smb: 0,
    hml: 0,
    mktRf: 0,
    smbPval: 0,
    hmlPval: 0,
    mktRfPval: 0,
    rSquared: 0,
    expectedReturn: 0,
  })

  

  // STOCK weights is an object, lets pull it from redux


  const convertToScientific = (num) => {
    if (num < 0.0001) {
      num = num.toExponential(2);
      return num
    } else {
      return num.toFixed(4);
    }
  };


  const endDate = new Date(
    new Date().getFullYear(),
    new Date().getMonth() - 1,
    0
  )
    .toISOString()
    .slice(0, 10);

  console.log("endDate", endDate);

  const startDate = new Date(
    new Date().getFullYear() - 5,
    new Date().getMonth() - 1,
    0
  )
    .toISOString()
    .slice(0, 10);

  console.log("startDate", startDate);  

  const [graphParams, setGraphParams] = useState({
    hml: true,
    smb: true,
    mktRf: true,
  });

  const graphSettingsChange = (event) => {
    event.preventDefault();
    console.log(event.target.name);
    setGraphParams({
      ...graphParams,
      [event.target.name]: !graphParams[event.target.name],
    });
  };





  useEffect(() => {


    const getFamaFrench = async () => {
      try {
        const weights =  await idbPromise("stockWeights", "get");
        console.log("WEIGHTS", weights[0])
        var {portfolio_id, ...weightsStorage} = weights[0];
        weightsStorage = await JSON.stringify(weightsStorage);
        console.log("weightsStorage", weightsStorage);
        const response = await axios.get(`http://127.0.0.1:8000/famafrench`, {
          params: {
            stockWeights: weightsStorage,
            start: startDate,
            end: endDate,
          },
        });
        console.log("response", response);
        var stats = response.data[1];

        console.log("stats click here", stats)
        var dataArray = JSON.parse(response.data[0]);
        console.log("dataArr", dataArray);
        for (const key in stats ) {
          if(key == "params"){
            setStats((prevStats) => ({
              ...prevStats,
              hml: stats[key]["HML"].toFixed(4),
              mktRf: stats[key]["Mkt-RF"].toFixed(4),
              smb: stats[key]["SMB"].toFixed(4)
            }));
          } else if (key == "pvalues"){
            setStats((prevStats) => ({
              ...prevStats,
              hmlPval: convertToScientific(stats[key]["HML"]),
              mktRfPval: convertToScientific(stats[key]["Mkt-RF"]),
              smbPval: convertToScientific(stats[key]["SMB"]),
            }));
          } else {
            setStats((prevStats) => ({
              ...prevStats,
              rSquared: stats["rsquared"].toFixed(4),
              expectedReturn: (stats["expected_return"] * 100).toFixed(2),
              sharpe: stats["sharpe"].toFixed(4),
            }));
          }
        }

  

        
        for (const key in dataArray) {
          let MktRf = "Mkt-RF";
          setDates((prevDates) => [...prevDates, key]);
          setPortfolio((prevPortfolio) => [
            ...prevPortfolio,
            dataArray[key].Portfolio,
          ]);
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


  console.log("stats recheck", stats)



  const options = {
    animdationEnabled: true,
    exportEnabled: true,
    theme: "dark1",
    title: {
      text: "Fama French Model",
    },
    axisX: {
      title: "Date",
      labelFontSize: 12,
      valueFormatString: "MMM YYYY",
      crosshair: {
        enabled: true,
        snapToDataPoint: true,
      },
      minimum: new Date(dates[0]),
      maximum: new Date(dates[dates.length - 1]),
    },
    axisY: {
      title: "Percent",
    },
    data: [
      {
        type: "spline",
        name: "Portfolio",
        toolTipContent: `Date: {x}<br />Portfolio: {y}%`,
        showInLegend: true,
        legendText: "Portfolio",
        dataPoints: portfolio.map((point, index) => ({
          x: new Date(dates[index]),
          y: point,
        })),
      },
      graphParams.mktRf && {
        type: "spline",
        name: "Mkt-Rf",
        toolTipContent: "Date: {x}<br />Mkt-Rf: {y}",
        showInLegend: true,
        legendText: "Mkt-RF",
        dataPoints: mktRf.map((point, index) => ({
          x: new Date(dates[index]),
          y: point,
        })),
      },
      graphParams.smb && {
        type: "spline",
        name: "SMB",
        toolTipContent: "Date: {x}<br />SMB: {y}",
        showInLegend: true,
        legendText: "SMB",
        dataPoints: smb.map((point, index) => ({
          x: new Date(dates[index]),
          y: point,
        })),
      },
      graphParams.hml && {
        type: "spline",
        name: "HML",
        toolTipContent: "Date: {x}<br />HML: {y}",
        showInLegend: true,
        legendText: "HML",
        dataPoints: hml.map((point, index) => ({
          x: new Date(dates[index]),
          y: point,
        })),
      },
    ],
  };

  return (
    <>
      <div className={isLoaded ? "d-flex justify-content-center" : "d-none"}>
        <div className="card mt-5 col-10">
        <form
          className="col-lg d-flex justify-content-center mb-2"
          ref={graphParams}
          onSubmit={graphSettingsChange}
        >
          <button
            className={`btn btn-outline-dark m-3 mb-3 ${
              graphParams.smb ? "active" : ""
            }`}
            name="smb"
            onClick={graphSettingsChange}
          >
            SMB
          </button>
          <button
            className={`btn btn-outline-dark m-3 mb-3 ${
              graphParams.hml ? "active" : ""
            }`}
            name="hml"
            onClick={graphSettingsChange}
          >
            HML
          </button>
          <button
            className={`btn btn-outline-dark m-3 mb-3 ${
              graphParams.mktRf ? "active" : ""
            }`}
            name="mktRf"
            onClick={graphSettingsChange}
          >
            Mkt-Rf
          </button>
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
            <h4>Expected Yearly Return: {stats.expectedReturn}% </h4>
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
        sharpeRatio={stats.sharpe}
        mktRfBeta={stats.mktRf}
        smbBeta={stats.smb}
        hmlBeta={stats.hml}
        smbPval={stats.smbPval}
        hmlPval={stats.hmlPval}
        mktRfPval={stats.mktRfPval}
        rSquared={stats.rSquared}
        stockInfo={Boolean(false)}
      />
     </div>


    </>
  );
};

export default FamaFrench;
