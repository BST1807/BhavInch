// components/TokenChart.jsx
import React from "react";
import { Line } from "react-chartjs-2";
import useTokenChart from "../hooks/useTokenChart";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const TokenChart = ({ chainId, tokenAddress }) => {
  const { data, loading, error } = useTokenChart(chainId, tokenAddress);

  if (loading) return <p>Loading chart...</p>;
  if (error) return <p>Error loading chart: {error}</p>;
  if (!data?.candles?.length) return <p>No chart data.</p>;

  const labels = data.candles.map(candle => new Date(candle.timestamp * 1000).toLocaleString());
  const prices = data.candles.map(candle => candle.close);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Price",
        data: prices,
        fill: false,
        borderColor: "#3b82f6",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="w-full">
      <Line data={chartData} />
    </div>
  );
};

export default TokenChart;
