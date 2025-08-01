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
        const res1 = await fetch(`http://localhost:3001/api/portfolio-balances?chainId=${chainId}&wallet=${address}`);
        const balances = await res1.json();
        console.log("✅ Balances:", balances);

        const res2 = await fetch(`http://localhost:3001/api/portfolio-pnl?chainId=${chainId}&wallet=${address}`);
        const pnl = await res2.json();
        console.log("✅ PnL:", pnl);

        const chainPnL = pnl.result?.find((r) => Number(r.chain_id) === Number(chainId));
        setTotalPnl(chainPnL?.abs_profit_usd ?? 0);
        setTotalRoi(chainPnL?.roi ?? 0);

        setTokens(balances.result || []);

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
