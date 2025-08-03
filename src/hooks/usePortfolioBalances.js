import { useEffect, useState } from "react";
import axios from "axios";


const CHAIN_ID_TO_COINGECKO_ID = {
  1: "ethereum",          // Ethereum Mainnet
  137: "matic-network",   // Polygon Mainnet
  56: "binancecoin",      // BNB Chain Mainnet
  80001: "matic-network", // Polygon Mumbai Testnet 
  
};

export default function usePortfolioBalances(chainId, wallet) {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!chainId || !wallet) return;

      setLoading(true);

      try {
        // ✅ Fetch balances
        const response = await axios.get("http://localhost:3001/api/balances", {
          params: { chainId, wallet },
        });

        console.log("Balances API raw response:", response.data);

        const balances = response.data.balances || response.data;

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

        // ✅ Fetch all tokens
        const tokensRes = await axios.get("http://localhost:3001/api/all-tokens", {
          params: { chainId },
        });

        const allTokens = tokensRes.data.tokens || tokensRes.data;

        // ✅ Get native coin USD price
        let nativeUSD = 0;
        const coingeckoId = CHAIN_ID_TO_COINGECKO_ID[chainId] || "ethereum";

        try {
          const coingeckoRes = await axios.get(
            `https://api.coingecko.com/api/v3/simple/price`,
            {
              params: {
                ids: coingeckoId,
                vs_currencies: "usd",
              },
            }
          );

          console.log("Native coin USD response:", coingeckoRes.data);

          nativeUSD = coingeckoRes.data[coingeckoId].usd;
          console.log(`Native coin USD (${coingeckoId}):`, nativeUSD);
        } catch (err) {
          console.error("Native coin USD fetch error:", err.message);
        }

        // ✅ Enrich tokens with metadata & USD price
        const enriched = await Promise.all(
          tokenList.map(async (t) => {
            const tokenMeta = allTokens[t.address] || {};
            const decimals = tokenMeta.decimals ?? 18;
            const symbol = tokenMeta.symbol ?? "UNKNOWN";
            const logoURI = tokenMeta.logoURI ?? "";

            const balanceFormatted = Number(t.balanceRaw) / 10 ** decimals;

            let usdPrice = 0;

            try {
              const spotRes = await axios.get("http://localhost:3001/api/spot-price", {
                params: {
                  chainId,
                  tokenAddress: t.address,
                },
              });

              const nativePrice = Number(spotRes.data.priceInNative) || 0;

              usdPrice = nativePrice * nativeUSD;

              console.log(
                `Spot price for ${symbol}: Native ${nativePrice}, USD ${usdPrice}`
              );
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
