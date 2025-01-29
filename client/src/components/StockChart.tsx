import { useEffect, useState, useCallback } from "react";
import ReactApexChart from "react-apexcharts";
import { Button } from "./ui/button";
import { ChartOptions, ChartData } from "@/types/charts";
import "../../src/index.css";
import dayjs from "dayjs";

import axios from "axios";

const pyBackEnd = "http://127.0.0.1:8000";

export async function stockData(params: { symbol: string, start: string, end: string }) {
    const response = await axios.get(
      `${pyBackEnd}/stockgraph`,
      {
        params: {
          ...params,
        },
      }
    );
    return response.data;
  }

const StockChart = ({symbol}) => {
  const [seriesSelection, setSeriesSelection] = useState("one_year");
  const years = ["one_month", "six_months", "one_year", "three_year", "five_year", "ytd", "all"];

  const formatVolume = (volume: number) => {
    if (volume > 1000000000) {
      return volume / 1000000000 + "B";
    } else if (volume > 1000000) {
      return volume / 1000000 + "M";
    } else if (volume > 1000) {
      return volume / 1000 + "K";
    } else {
      return volume.toFixed(2);
    }
  }

  const initialGraphData = years.reduce((acc, year) => {
    acc[year] = [
      {
        name: "Price",
        data: [],
        type: "area",
      },
      {
        name: "Volume",
        data: [],
        type: "column",
      },
    ];
    return acc;
  }
  , {} as Record<string, ChartData[]>);

  const [graphData, setGraphData] = useState<Record<string, ChartData[]>>(initialGraphData);


  const [chartOptions, setChartOptions] = useState< ChartOptions >({
    chart: {
      foreColor: "#ccc",
      height: 350,
      stacked: true,
      dropShadow: {
				enabledSeries: [0],
				top: -2,
				left: 2,
				blur: 5,
				opacity: 0.06,
			},
			toolbar: {
				show: false,
			},
    },
    colors: ['#7B6FFF', '#D8D7EE'],
    stroke: {
			curve: 'smooth',
			width: [3, 0],
		},
    dataLabels: {
      enabled: false,
    },
    markers: {
			size: 0,
			strokeColor: '#fff',
			strokeWidth: 3,
			strokeOpacity: 1,
			fillOpacity: 1,
			hover: {
				size: 6,
			},
    },
    xaxis: {
			type: 'datetime',
      axisBorder: {
				show: false,
			},
			axisTicks: {
				show: false,
			},
      labels: {
        style: {
          colors: "#ccc",
        },
        datetimeFormatter: {
          year: 'yyyy',
          month: 'MMM \ yyyy',
          day: 'dd MMM \ yyyy',
        },
      },
    },
    tooltip: {
      x: {
        format: "dd MMM yyyy",

      },
    },
    grid: {
			show: false,
			padding: {
				left: -5,
				right: 5,
			},
		},
		legend: {
			position: 'top',
			horizontalAlign: 'left',
			offsetY: 15,
		},

    fill: {
      type: ["gradient", "solid"],
      gradient: {
        shadeIntensity: 1,
        type: "vertical",
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 50, 100],
      },
    },  
    yaxis: [
      {
        offsetY: 0,
      seriesName: "Price",
      tickAmount: 5,
      tooltip: {
        enabled: true,
      },
      labels: {
        formatter: function (val : number) {
          return "$" + val.toFixed(2);
        },
      },
    },
    {
      seriesName: "Volume",
      show: false,
      labels: {
        formatter: function (val : number) {
          return formatVolume(val);
        },
      },
    },
    ],
  }

);

  useEffect(() => {
    if (!symbol || symbol == "stock-search") {
      window.location.href = "/";
      return;
    }
    const currParams = {
      symbol: symbol,
      start: dayjs().subtract(1, "year").format("YYYY-MM-DD"),
      end: dayjs().format("YYYY-MM-DD"),
    };
    const fetchData = async () => {
      const jsonData = await stockData(currParams);
      const allData = await stockData({ symbol: symbol, start: "1962-01-01", end: dayjs().format("YYYY-MM-DD") });
      const parsedAllData: { Date: string; Close: number; Volume: number }[] = 
        JSON.parse(allData);
      const parsedData: { Date: string; Close: number; Volume: number }[] =
        JSON.parse(jsonData);
      const fiveYearData = await stockData({ symbol: symbol, start: dayjs().subtract(5, "year").format("YYYY-MM-DD"), end: dayjs().format("YYYY-MM-DD") });
      const parsedFiveYearData: { Date: string; Close: number; Volume: number }[] = JSON.parse(fiveYearData);
      const seriesData = parsedData.map((data) => [
        new Date(data.Date).getTime(),
        data.Close
      ]);
      const volumeData = parsedData.map((data) => [
        new Date(data.Date).getTime(),
        data.Volume
      ]);
      const totalSeriesData = parsedAllData.map((data) => [
        new Date(data.Date).getTime(),
        data.Close
      ]);
      const totalVolumeData = parsedAllData.map((data) => [
        new Date(data.Date).getTime(),
        data.Volume
      ]);
      const fiveYearSeriesData = parsedFiveYearData.map((data) => [
        new Date(data.Date).getTime(),
        data.Close
      ]);
      const fiveYearVolumeData = parsedFiveYearData.map((data) => [
        new Date(data.Date).getTime(),
        data.Volume
      ]);
      const threeYearSeriesData = fiveYearSeriesData.filter((data) => {
        const date = dayjs(data[0]);
        return date.isAfter(dayjs().subtract(3, "year"));
      }
      );
      const threeYearVolumeData = fiveYearVolumeData.filter((data) => {
        const date = dayjs(data[0]);
        return date.isAfter(dayjs().subtract(3, "year"));
      }
      );
      
      const newGraphData = graphData;
      newGraphData.one_year[0].data = seriesData;
      newGraphData.one_year[1].data = volumeData;
      newGraphData.all[0].data = totalSeriesData;
      newGraphData.all[1].data = totalVolumeData;
      newGraphData.three_year[0].data = threeYearSeriesData;
      newGraphData.three_year[1].data = threeYearVolumeData;
      newGraphData.five_year[0].data = fiveYearSeriesData;
      newGraphData.five_year[1].data = fiveYearVolumeData;
      setGraphData(newGraphData);
      handleTimeline("one_year");
    };
    fetchData();
  }, [symbol]);


  const findMinMaxPrice = (prices: number []) => {
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const difference = maxPrice - minPrice;
    const padding = difference * 0.2;
    const minPricePadding = minPrice - padding; 
    const maxPricePadding = maxPrice + padding;
    return { minPricePadding, maxPricePadding };
  }

	const calculateVolumeMax = useCallback((volumeChartData : number[]) => {
    const maxVolume = Math.max(...volumeChartData);
    const padding = maxVolume * 3;
    return maxVolume + padding;
	}, []);


  const handleTimeline = (timeline: string) => {
    let startDate : dayjs.Dayjs = dayjs();
    switch (timeline) {
      case "one_month":
        startDate = dayjs().subtract(1, "month");
        break;
      case "six_months":
        startDate = dayjs().subtract(6, "month");
        break;
      case "one_year":
        startDate = dayjs().subtract(1, "year");
        break;
      case "three_year":
        startDate = dayjs().subtract(3, "year");
        break;
      case "five_year":
        startDate = dayjs().subtract(5, "year");
        break;
      case "ytd":
        startDate = dayjs().startOf("year");
        break;
      case "all":
        if (typeof graphData.all[0].data[0][0] === "number") {
          startDate = dayjs(graphData.all[0].data[0][0]);
        }
        break;
      default:
        startDate = dayjs().subtract(1, "month").add(1, "day");
        break
    }
    const greaterThanOneYear : boolean = dayjs().diff(startDate, "year") > 1;
    const [filteredData, filteredVolumeData] =
    [         
            graphData[greaterThanOneYear ? timeline : "one_year"][0].data.filter((dataPoint) => {
            const date = dayjs(dataPoint[0]);
            return date.isAfter(startDate);
          }), 
          graphData[greaterThanOneYear ? timeline : "one_year"][1].data.filter((dataPoint) => {
            const date = dayjs(dataPoint[0]);
            return date.isAfter(startDate);
          })
    ]
    const newGraphData = graphData;
    newGraphData[timeline][0].data = filteredData;
    newGraphData[timeline][1].data = filteredVolumeData;
    setGraphData(newGraphData);
    setSeriesSelection(timeline);
    const volumes = filteredVolumeData.map((dataPoint) => dataPoint[1]);
    const prices = filteredData.map((dataPoint) => dataPoint[1]);
    const volumeMax = calculateVolumeMax(volumes);
    const { minPricePadding, maxPricePadding } = findMinMaxPrice(prices);    
    setChartOptions({
      ...chartOptions, 
      xaxis: {
        ...chartOptions.xaxis,
        min: new Date(startDate.toString()).getTime(),
      },
      yaxis: [
        {
          ...chartOptions.yaxis[0],
          min: minPricePadding,
          max: maxPricePadding,
        },
        {
          ...chartOptions.yaxis[1],
          max: volumeMax,
          show: false,
        },
      ],
    });

      
  };

  return (
    <div>
      <div id="chart" className="card"> 
        <div className="toolbar text-center gap-2">
          <Button
            variant={"outline"}
            id="one_month"
            className={`${seriesSelection === "one_month" ? "bg-blue-400 text-white" : ""} hover:bg-blue-400 hover:text-white`}
            onClick={() => handleTimeline("one_month")}
          >
            1M
          </Button>

          <Button
            variant={"outline"}
            className={`${seriesSelection === "six_months" ? "bg-blue-400 text-white" : ""} hover:bg-blue-400 hover:text-white`}
            id="six_months"
            onClick={() => handleTimeline("six_months")}
          >
            6M
          </Button>
          <Button
            variant={"outline"}
            className={`${seriesSelection === "ytd" ? "bg-blue-400 text-white" : ""} hover:bg-blue-400 hover:text-white`}
            id="ytd"
            onClick={() => handleTimeline("ytd")}
          >
            YTD
          </Button>
          <Button
            variant={"outline"}
            className={`${seriesSelection === "one_year" ? "bg-blue-400 text-white" : ""} hover:bg-blue-400 hover:text-white`}
            id="one_year"
            onClick={() => handleTimeline("one_year")}
          >
            1Y
          </Button>
          <Button
            variant={"outline"}
            className={`${seriesSelection === "three_year" ? "bg-blue-400 text-white" : ""} hover:bg-blue-400 hover:text-white`}
            id="three_year"
            onClick={() => handleTimeline("three_year")}
          >
            3Y
          </Button>
          <Button
            variant={"outline"}
            className={`${seriesSelection === "five_year" ? "bg-blue-400 text-white" : ""}  hover:bg-blue-400 hover:text-white`}
            id="five_year"
            onClick={() => handleTimeline("five_year")}
          >
            5Y
          </Button>

          <Button
            variant={"outline"}
            className={`${seriesSelection === "all" ? "bg-blue-400 text-white" : ""} hover:bg-blue-400 hover:text-white`}
            id="all"
            onClick={() => handleTimeline("all")}
          >
            ALL
          </Button>
        </div>

        <div id="chart-timeline">
            <ReactApexChart
              options={chartOptions}
              series={graphData[seriesSelection]}
              height={350}
            />
        </div>
      </div>
      <div id="html-dist"></div>
    </div>
  );
};

export default StockChart;




