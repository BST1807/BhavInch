import { useEffect, useState } from "react";
import axios from "axios";

export default function usePortfolioBalances(chainId, wallet) {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!chainId || !wallet) return;

      setLoading(true);

      try {
        // ✅ 1. Get balances
        const response = await axios.get("http://localhost:3001/api/balances", {
          params: { chainId, wallet },
        });

        console.log("Balances API raw response:", response.data);

        const balances = response.data.balances || response.data; // fallback if no `balances` key

        if (!balances || typeof balances !== "object") {
          console.warn("No balances returned.");
          setTokens([]);
          return;
        }

        const tokenList = Object.entries(balances)
          .filter(([_, b]) => Number(b) > 0)
          .map(([address, balance]) => ({
            address,
            balanceRaw: balance,
          }));

        // ✅ 2. Get all tokens meta
        const tokensRes = await axios.get("http://localhost:3001/api/all-tokens", {
          params: { chainId },
        });

        const allTokens = tokensRes.data.tokens || tokensRes.data;

        // ✅ 3. Enrich with meta + spot price
        const enriched = await Promise.all(
          tokenList.map(async (t) => {
            const tokenMeta = allTokens[t.address] || {};
            const decimals = tokenMeta.decimals ?? 18;
            const symbol = tokenMeta.symbol ?? "UNKNOWN";
            const logoURI = tokenMeta.logoURI ?? "";

            const balanceFormatted = Number(t.balanceRaw) / 10 ** decimals;

            // ✅ Spot price (fixed!)
            let usdPrice = 0;
            try {
              const spotRes = await axios.get("http://localhost:3001/api/spot-price", {
                params: {
                  chainId,
                  tokenAddress: t.address,
                },
              });

              // ✅ Extract first value + convert from wei to dollars
              const raw = Object.values(spotRes.data)[0];
              usdPrice = Number(raw) / 1e18;

            } catch (err) {
              console.error(`Spot price error for ${symbol}:`, err.message);
            }

            return {
              address: t.address,
              symbol,
              decimals,
              logoURI,
              balance: balanceFormatted.toFixed(6),
              usdPrice,
            };
          })
        );

        setTokens(enriched);
      } catch (err) {
        console.error("Error fetching balances:", err);
        setTokens([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [chainId, wallet]);

  return { tokens, loading };
}
