import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CanvasJSReact from "@canvasjs/react-stockcharts";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CanvasJS = CanvasJSReact.CanvasJS;

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const FamaFrench = () => {
  const [dates, setDates] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [mktRf, setMktRf] = useState([]);
  const [smb, setSmb] = useState([]);
  const [hml, setHml] = useState([]);
  const [expectedReturn, setExpectedReturn] = useState();
  const [pValues, setPValues] = useState();


  const endDate = new Date(
    new Date().getFullYear(),
    new Date().getMonth() - 1,
    0
  )
    .toISOString()
    .slice(0, 10);

  const startDate = new Date(
    new Date().getFullYear() - 5,
    new Date().getMonth() - 1,
    0
  )
    .toISOString()
    .slice(0, 10);

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

  const stocks = ["AAPL", "MSFT", "AMZN"];

  const weights = [0.4, 0.4, 0.2];

  useEffect(() => {
    const getFamaFrench = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/famafrench", {
          params: {
            stocks: stocks.join(","),
            weights: weights.join(","),
            start: startDate,
            end: endDate,
          },
        });
        console.log("response", response);
        var dataArray = JSON.parse(response.data[0]);
        console.log(dataArray);
        const expectedReturn = response.data[1]["expected_return"] * 1000;
        setExpectedReturn(expectedReturn.toFixed(2));
        console.log(expectedReturn);

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
      } catch (err) {
        console.log(err);
      }
    };
    getFamaFrench();
  }, [dates, portfolio, mktRf, smb, hml]);

  console.log(mktRf);

  // useEffect(() => {
  //     fetch("http://127.0.0.1:8000/fama/AAPL,MSFT,AMZN/0.4,0.4,0.2/2010-06-30/2023-6-30")
  //     .then((res) => res.json())
  //     .then((data) => {

  //         var dataArray = JSON.parse(data[0]);
  //         console.log(dataArray);

  //         for(const key in dataArray){
  //             let MktRf = 'Mkt-Rf'
  //             setDates(prevDates => [...prevDates, key]);
  //             setPortfolio(prevPortfolio => [...prevPortfolio, dataArray[key].Portfolio]);
  //             setMktRf(prevMktRf => [...prevMktRf, dataArray[key][MktRf]]);
  //             setSmb(prevSmb => [...prevSmb, dataArray[key].SMB]);
  //             setHml(prevHml => [...prevHml, dataArray[key].HML]);
  //         }
  //     }
  //     )
  // }, [dates, portfolio, mktRf, smb, hml]);

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
      <div className="container">
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
        <div className="row">
          <div className="col-lg d-flex justify-content-center">
            <h4>Expected Yearly Return: {expectedReturn}% </h4>
          </div>
        </div>
        <div className="row">
          <CanvasJSChart options={options} />
        </div>
      </div>
    </>
  );
};

export default FamaFrench;
