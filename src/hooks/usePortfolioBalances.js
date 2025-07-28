import { useState, useEffect } from 'react';

export default function usePortfolioBalances(chainId, walletAddress) {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) return;

    const fetchBalances = async () => {
      setLoading(true);

      try {
        // 1️⃣ Fetch balances
        const balancesRes = await fetch(
          `http://localhost:3001/api/balances?chainId=${chainId}&wallet=${walletAddress}`
        );
        const balancesData = await balancesRes.json();
        console.log('Raw balancesData:', balancesData);

        // 2️⃣ Make sure you get an array!
        const balancesArray = Array.isArray(balancesData)
          ? balancesData
          : balancesData.balances || balancesData.tokens || Object.values(balancesData);

        // 3️⃣ Fetch portfolio value
        const portfolioRes = await fetch(
          `http://localhost:3001/api/portfolio/value?chainId=${chainId}&wallet=${walletAddress}`
        );
        const portfolioData = await portfolioRes.json();
        console.log('Raw portfolioData:', portfolioData);

        const enriched = balancesArray
          .filter((t) => Number(t.balance) > 0)
          .map((t) => {
            const usdToken = portfolioData.find(
              (p) => p.address?.toLowerCase() === t.token_address?.toLowerCase()
            );

            return {
              address: t.token_address,
              symbol: t.symbol,
              logoURI: t.logoURI,
              balance: t.balance,
              allowance: t.allowance || '0',
              usdPrice: usdToken?.price || 0,
            };
          });

        setTokens(enriched);
      } catch (err) {
        console.error('Portfolio Balances Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [chainId, walletAddress]);

  return { tokens, loading };
}
