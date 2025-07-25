import React, { useState } from 'react';
import { Wallet, ArrowLeftRight, PieChart, Settings, Menu, X } from 'lucide-react';
const WalletComponent = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false);
      // For demo purposes, don't actually connect
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Wallet Connection</h2>
        
        {/* Connection Status */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-gray-900 font-medium">
              {isConnected ? 'Connected' : 'Not Connected'}
            </span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {isConnected ? 'Your wallet is connected and ready to use' : 'Connect your wallet to start trading'}
          </div>
        </div>

        {/* Connect Wallet Button */}
        <button 
          onClick={handleConnect}
          disabled={isConnecting || isConnected}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-xl transition-colors mb-6"
        >
          {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Connect Wallet'}
        </button>

        {/* Supported Wallets */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Supported Wallets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['MetaMask', 'WalletConnect', 'Coinbase Wallet', 'Trust Wallet'].map((wallet) => (
              <div key={wallet} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-gray-900">{wallet}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Network Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <h4 className="font-medium text-blue-900 mb-2">Supported Networks</h4>
          <div className="text-sm text-blue-700 space-y-1">
            {Object.values(CONFIG.SUPPORTED_CHAINS).map((chain) => (
              <div key={chain}>• {chain}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletComponent;