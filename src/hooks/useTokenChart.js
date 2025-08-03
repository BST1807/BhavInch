// hooks/useTokenChart.js
import { useEffect, useState } from "react";
import axios from "axios";

export default function useTokenChart(chainId, tokenAddress, resolution = "1h") {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chainId || !tokenAddress) return;

    const fetchChart = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:3001/api/token-chart", {
          params: { chainId, tokenAddress, resolution },
        });
        setData(res.data);
      } catch (err) {
        console.error("Chart API error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChart();
  }, [chainId, tokenAddress, resolution]);

  return { data, loading, error };
}
