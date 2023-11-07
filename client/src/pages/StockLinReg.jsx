import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CanvasJSReact from "@canvasjs/react-stockcharts";

const CanvasJS = CanvasJSReact.CanvasJS;

const CanvasJSChart = CanvasJSReact.CanvasJSChart;


const StockLinReg = () => {
    const { symbol } = useParams();
    const [index, setIndex] = useState([]);
    const [formulaB, setFormulaB] = useState();
    const [formulaY, setFormulaY] = useState();
    const [isLoaded, setIsLoaded] = useState(false);
    const [startDate, setStartDate] = useState(
        new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10)
    );
    const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
    



    console.log("startDate", startDate);  
    console.log("endDate", endDate);
    console.log("symbol", symbol);

   

    
    
    useEffect(() => {
        fetch(`http://127.0.0.1:8000/AAPL/^GSPC/${startDate}/${endDate}`)
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            var dataArray = JSON.parse(data[0]);
            console.log(dataArray);
            var dps = [];
            for (var i = 0; i < dataArray.length; i++) {
                dps.push({
                    x: Number(dataArray[i][1]),
                    y: Number(dataArray[i][0])
                });

            }

            setFormulaB(data[1])
            setFormulaY(data[2])
            setIndex(dps);
  
        });

        
    }, [index, formulaB, formulaY]);

    console.log(formulaB);
    console.log(formulaY);

    const regressionLine = index.map((point) => {
        return {
            x: point.x,
            y: formulaY + formulaB * point.x
        }
    }
    )

    console.log(index);

    console.log(regressionLine);

    const options = {
        theme: "dark2",
        title: {
          text: "AAPL vs SP500 Linear Regression"
        },
        axisX: {
          title: "X-Axis Label"
        },
        axisY: {
          title: "Y-Axis Label"
        },


        data: [
            {
              type: "scatter",
              showInLegend: true,
              legendText: "Data Points",
              dataPoints: index.map(point => ({
                x: point.x,
                y: point.y,
                toolTipContent: `SP500: ${point.x}, APPL: ${point.y}`
              })),
              label: "Data Points"
            },
            {
              type: "line",
              showInLegend: true,
              legendText: "Linear Regression Line",
              dataPoints: regressionLine.map(point => ({
                x: point.x,
                y: point.y,
                toolTipContent: `SP500: ${point.x}, APPL: ${point.y}`
              })),
            }
          ]
      };

//    what is the bootstrap class for align text to the center of the page? 

 

      return (
        <div className="linear-reg mt-3 ">
        <div className="container">
        <div className="row w-100">
            <input type="search-bar" name="symbol" value={symbol} />
            <div className="col-lg d-flex justify-content-center">
                <div className="form-group text-center w-50">
                    <label>Start Date</label>
                    <input
                        type="date"
                        className="form-control text-center"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
            </div>
            <div className="col-lg d-flex justify-content-center">
                <div className="form-group text-center w-50">
                    <label>End Date</label>
                    <input
                        type="date"
                        className="form-control text-center"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
            </div>
        </div>
    </div>
        
        <div className="chart mt-2">
          <CanvasJSChart options={options} />
        </div>
        </div>
      );
    };
    
    export default StockLinReg;


        
