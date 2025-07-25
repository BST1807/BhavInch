import React, { useState } from 'react';
import { Wallet, ArrowLeftRight, PieChart, Settings, Menu, X } from 'lucide-react';
const Portfolio = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const mockTokens = [
    { symbol: 'ETH', name: 'Ethereum', balance: '0.00', value: '$0.00', change: '+0.00%', changePositive: true },
    { symbol: 'USDC', name: 'USD Coin', balance: '0.00', value: '$0.00', change: '+0.00%', changePositive: true },
    { symbol: 'UNI', name: 'Uniswap', balance: '0.00', value: '$0.00', change: '+0.00%', changePositive: true },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Portfolio Summary */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
            <div className="text-sm text-blue-600 font-medium">Total Balance</div>
            <div className="text-2xl font-bold text-blue-900">$0.00</div>
            <div className="text-xs text-blue-700 mt-1">0.00% (24h)</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
            <div className="text-sm text-green-600 font-medium">24h Change</div>
            <div className="text-2xl font-bold text-green-900">+$0.00</div>
            <div className="text-xs text-green-700 mt-1">+0.00%</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
            <div className="text-sm text-purple-600 font-medium">Assets</div>
            <div className="text-2xl font-bold text-purple-900">0</div>
            <div className="text-xs text-purple-700 mt-1">0 tokens</div>
          </div>
        </div>
      </div>

      {/* Token List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Your Tokens</h3>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:text-gray-400"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        <div className="space-y-3">
          {mockTokens.map((token, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {token.symbol.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{token.symbol}</div>
                  <div className="text-sm text-gray-600">{token.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">{token.balance}</div>
                <div className="text-sm text-gray-600">{token.value}</div>
                <div className={`text-xs font-medium ${
                  token.changePositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {token.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {mockTokens.length === 0 && (
          <div className="text-center py-12">
            <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No tokens found</p>
            <p className="text-sm text-gray-400 mt-1">Connect your wallet to view your portfolio</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;