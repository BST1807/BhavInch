import { useState, useEffect } from "react";

export default function usePortfolioBalances(chainId, walletAddress) {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) return;

    const fetchBalances = async () => {
      setLoading(true);

      try {
        // ✅ 1️⃣ Get balances
        const balancesRes = await fetch(
          `http://localhost:3001/api/balances?chainId=${chainId}&wallet=${walletAddress}`
        );
        const balancesData = await balancesRes.json();
        console.log('Raw balancesData:', balancesData);

        const balancesArray = Array.isArray(balancesData)
          ? balancesData
          : balancesData.balances || balancesData.tokens || Object.entries(balancesData).map(
              ([address, balance]) => ({
                address,
                balance,
              })
            );

        // ✅ 2️⃣ Get prices
        const portfolioRes = await fetch(
          `http://localhost:3001/api/portfolio/value?chainId=${chainId}&wallet=${walletAddress}`
        );
        const portfolioData = await portfolioRes.json();
        console.log('Raw portfolioData:', portfolioData);

        const enriched = balancesArray
          .filter(t => Number(t.balance) > 0) // keep only positive raw balances
          .map((t) => {
            const usdToken = (portfolioData.result || []).find(
              (p) =>
                p.address?.toLowerCase?.() === t.token_address?.toLowerCase?.() ||
                p.address?.toLowerCase?.() === t.address?.toLowerCase?.()
            );

            const address = t.token_address || t.address;

            // ✅ fallback decimals
            let decimals = t.decimals || usdToken?.decimals;
            if (!decimals) {
              // fallback: assume 6 for USDC or 18 for generic ERC20
              if (address?.toLowerCase() === "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48") {
                decimals = 6; // USDC
              } else {
                decimals = 18; // default ERC20
              }
            }

            // ✅ format balance
            const balance = Number(t.balance) / (10 ** decimals);

            // ✅ fallback USD price if missing
            const usdPrice = usdToken?.price ?? (
              address?.toLowerCase() === "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
                ? 1
                : 0
            );

            return {
              address,
              balance,
              decimals,
              symbol: t.symbol || usdToken?.symbol || `${address?.slice(0, 6)}...`,
              logoURI: t.logoURI || usdToken?.logoURI,
              allowance: t.allowance || 'N/A',
              usdPrice,
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
