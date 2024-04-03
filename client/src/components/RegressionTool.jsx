import CanvasJSReact from "@canvasjs/react-stockcharts";

const RegressionTool = ({ stockSymbol, searchParams, index, formulaY, formulaB, indexName, searchIndex }) => {
    const CanvasJS = CanvasJSReact.CanvasJS;
    const CanvasJSChart = CanvasJSReact.CanvasJSChart;
  const regressionLine = index.map((point) => {
    return {
      x: point.x,
      y: formulaY + formulaB * point.x,
    };
  });

  const options = {
    theme: "dark1",
    title: {
      text: `${stockSymbol} vs ${indexName} Linear Regression`,
    },
    axisX: {
      title: `${searchParams.index}`,
    },
    axisY: {
      title: `${stockSymbol}`,
      margin: 0,
    },

    data: [
      {
        type: "scatter",
        showInLegend: true,
        legendText: `${stockSymbol}`,
        dataPoints: index.map((point) => ({
          x: point.x,
          y: point.y,
          toolTipContent: `${searchIndex}: ${point.x}, ${stockSymbol}: ${point.y}`,
        })),
        label: "Data Points",
      },
      {
        type: "line",
        showInLegend: true,
        legendText: `${searchIndex}`,
        //  center the legend
        margin: 10,
        padding: 10,
        legendMarkerType: "none",
        dataPoints: regressionLine.map((point) => ({
          x: point.x,
          y: point.y,
          toolTipContent: `${searchIndex}: ${point.x}, ${stockSymbol}: ${point.y}`,
        })),
      },
    ],
  };
  return (
    <div>
      <CanvasJSChart options={options} className="mt-10" />
    </div>
  );
};
export default RegressionTool;
