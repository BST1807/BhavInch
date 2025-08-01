import React from 'react';
import { Wallet } from 'lucide-react';
import { useAccount, useChainId } from 'wagmi';
//import useSupportedChains from '../hooks/useSupportedChains';
import usePortfolioBalances from '../hooks/usePortfolioBalances';

const WalletComponent = () => {
  const { address, isConnected, isConnecting } = useAccount();
  const chainId = useChainId() || 1;
  //const { chains, loading: loadingChains } = useSupportedChains();

  // ✅ Use the same hook as Portfolio
  const { tokens, loading: loadingBalances } = usePortfolioBalances(chainId, address);

  // ✅ Calculate total USD
  const totalUSD = tokens.reduce(
    (acc, t) => acc + Number(t.balance) * t.usdPrice,
    0
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Wallet Connection</h2>

        {/* Connection Status */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center space-x-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            ></div>
            <span className="text-gray-900 font-medium">
              {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Not Connected'}
            </span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {isConnected
              ? `Connected wallet address: ${address}`
              : 'Connect your wallet using the Connect button above.'}
          </div>
        </div>

        {/* ✅ Portfolio Summary */}
        {isConnected && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Wallet Overview</h3>
            {loadingBalances ? (
              <p>Loading balances...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            )}
          </div>
        )}

        {/* ✅ Tokens List */}
        {isConnected && (
          <div className="bg-white rounded-2xl shadow border border-gray-200 p-4">
            <h3 className="text-md font-semibold text-gray-900 mb-3">Your Tokens</h3>
            {loadingBalances ? (
              <p>Loading balances...</p>
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
                        ${(Number(token.balance) * token.usdPrice).toFixed(2)}
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
        )}

        {/* Supported Networks */}
        
      </div>
    </div>
  );
};

export default WalletComponent;
