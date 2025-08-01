import React from "react";
import { useAccount, useChainId } from "wagmi";
import usePortfolioBalances from "../hooks/usePortfolioBalances";

const Portfolio = () => {
  // ✅ 1. Get connected wallet address
  const { address } = useAccount();

  // ✅ 2. Get connected chainId (wagmi v2+)
  const chainId = useChainId() || 1;
  const walletAddress = address;

  // ✅ 4. Call your hook with the dynamic chainId + wallet address
  const { tokens, loading } = usePortfolioBalances(chainId, walletAddress);

  // ✅ 5. Calculate total USD value
  const totalUSD = tokens.reduce(
    (acc, t) => acc + Number(t.balance) * t.usdPrice,
    0
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ✅ Portfolio summary */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Portfolio Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
            <div className="text-sm text-blue-600 font-medium">
              Total Balance
            </div>
            <div className="text-2xl font-bold text-blue-900">
              ${totalUSD.toFixed(2)}
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
            <div className="text-sm text-green-600 font-medium">
              Tokens Held
            </div>
            <div className="text-2xl font-bold text-green-900">
              {tokens.length}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Tokens list */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Your Tokens
        </h3>

        {loading ? (
          <p>Loading balances...</p>
        ) : !walletAddress ? (
          <p className="text-gray-500">Please connect your wallet.</p>
        ) : tokens.length === 0 ? (
          <p className="text-gray-500">No tokens found with balance.</p>
        ) : (
          <div className="space-y-4">
            {tokens.map((token) => (
              <div
                key={token.address}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {token.logoURI ? (
                    <img
                      src={token.logoURI}
                      alt={token.symbol}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">
                      {token.symbol}
                    </div>
                    <div className="text-sm text-gray-600">
                      Allowance: {token.allowance}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {(Number(token.balance) * token.usdPrice).toFixed(2)} ETH
                  </div>
                  <div className="text-xs text-gray-600">
                    Balance: {token.balance}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
