import React from 'react';
import { Wallet } from 'lucide-react';
import { useAccount } from 'wagmi';
import useSupportedChains from '../hooks/useSupportedChains';

const WalletComponent = () => {
  const { address, isConnected, isConnecting } = useAccount();

  const { chains, loading } = useSupportedChains();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Wallet Connection</h2>

        {/* Connection Status */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
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

        {/* Remove custom Connect button — handled by RainbowKit in Header */}

        {/* Supported Wallets (can keep for info) */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Supported Wallets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['MetaMask', 'WalletConnect', 'Coinbase Wallet', 'Trust Wallet'].map((wallet) => (
              <div
                key={wallet}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-gray-900">{wallet}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Supported Networks */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <h4 className="font-medium text-blue-900 mb-2">Supported Networks</h4>
          {loading ? (
            <p className="text-blue-700 text-sm">Loading supported networks...</p>
          ) : (
            <div className="text-sm text-blue-700 space-y-1">
              {chains.length > 0 ? (
                chains.map((chain) => (
                  <div key={chain.id}>• {chain.title || chain.name || `Chain ID: ${chain.id}`}</div>
                ))
              ) : (
                <p>No supported networks found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletComponent;
