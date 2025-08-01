import React from "react";
import { useAccount, useChainId } from "wagmi";
import useOneInchPortfolio from "../hooks/useOneInchPortfolio";

const Portfolio = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId() || 1;

  const { tokens, loading, error, totalPnl, totalRoi } = useOneInchPortfolio(
    chainId,
    address
  );

  const totalUSD = tokens.reduce((acc, t) => acc + (t.usd_value || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ✅ Portfolio Summary */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Portfolio Overview
        </h2>

        {!isConnected ? (
          <p className="text-gray-500">Please connect your wallet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4">
              <div className="text-sm text-yellow-600 font-medium">
                Total PnL
              </div>
              <div className="text-2xl font-bold text-yellow-900">
                ${totalPnl.toFixed(2)}
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
              <div className="text-sm text-purple-600 font-medium">
                ROI %
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {(totalRoi * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Tokens List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Your Tokens
        </h3>

        {!isConnected ? (
          <p className="text-gray-500">Please connect your wallet.</p>
        ) : loading ? (
          <p>Loading balances...</p>
        ) : error ? (
          <p className="text-red-500">Error fetching portfolio: {error}</p>
        ) : tokens.length === 0 ? (
          <p className="text-gray-500">No tokens found with balance.</p>
        ) : (
          <div className="space-y-4">
            {tokens.map((token) => (
              <div
                key={token.token_address}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {token.logo_url ? (
                    <img
                      src={token.logo_url}
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
                      Address:{" "}
                      {token.token_address.slice(0, 6)}...
                      {token.token_address.slice(-4)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    ${Number(token.usd_value).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600">
                    Balance: {Number(token.amount).toFixed(4)}
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
