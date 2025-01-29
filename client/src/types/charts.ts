import { ApexOptions } from "apexcharts";
export type ChartType = "area" | "column";
 export interface ChartData {
    name: string;
    data: number[][] | (number)[][];
    type: ChartType;
  }

 export interface YAxis extends ApexYAxis {
    seriesName: string;
    tickAmount?: number;
    tooltip?: { enabled: boolean };
    labels: {
      formatter: (val: number) => string;
    };
    min?: number;
    max?: number;
    show?: boolean;
    offsetY?: number;
  }

  export interface XAxis extends ApexXAxis {
    min?: number;
    max?: number;
  }
  
  export interface ChartOptions extends ApexOptions {
    chart: object;
    colors: string[];
    stroke: object;
    dataLabels: object;
    markers: object;
    xaxis : XAxis;
    tooltip: object;
    grid: object;
    legend: object;
    fill: object;
    yaxis: YAxis[];
}




