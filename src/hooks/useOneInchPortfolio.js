import { useEffect, useState } from "react";

export default function useOneInchPortfolio(chainId, address) {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPnl, setTotalPnl] = useState(0);
  const [totalRoi, setTotalRoi] = useState(0);

  useEffect(() => {
    if (!chainId || !address) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // ✅ Fetch DETAILS (not balances & pnl separately)
        const res = await fetch(`http://localhost:3001/api/portfolio-details?chainId=${chainId}&wallet=${address}`);
        const data = await res.json();
        console.log("✅ Portfolio DETAILS:", data);

        if (!data.result) throw new Error("No portfolio details returned.");

        // ✅ Save tokens array
        setTokens(data.result);

        // ✅ Calculate totals from tokens
        const totalPnlUsd = data.result.reduce((acc, t) => acc + (t.abs_profit_usd || 0), 0);
        const totalRoiAvg = data.result.length
          ? data.result.reduce((acc, t) => acc + (t.roi || 0), 0) / data.result.length
          : 0;

        setTotalPnl(totalPnlUsd);
        setTotalRoi(totalRoiAvg);

      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [chainId, address]);

  return { tokens, loading, error, totalPnl, totalRoi };
}
