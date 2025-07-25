import React, { useState } from 'react';
import { Wallet, ArrowLeftRight, PieChart, Settings, Menu, X } from 'lucide-react';
const SwapComponent = () => {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState(null);
  const [toToken, setToToken] = useState(null);

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Swap Tokens</h2>
        
        {/* From Token */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">From</span>
              <span className="text-sm text-gray-600">Balance: 0.00</span>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                <span className="font-medium">
                  {fromToken ? fromToken.symbol : 'Select Token'}
                </span>
              </button>
              <input
                type="text"
                className="flex-1 bg-transparent text-right text-xl font-medium outline-none"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Swap Arrow */}
          <div className="flex justify-center">
            <button className="p-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <ArrowLeftRight className="w-5 h-5 text-gray-600 transform rotate-90" />
            </button>
          </div>

          {/* To Token */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">To</span>
              <span className="text-sm text-gray-600">Balance: 0.00</span>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                <span className="font-medium">
                  {toToken ? toToken.symbol : 'Select Token'}
                </span>
              </button>
              <input
                type="text"
                className="flex-1 bg-transparent text-right text-xl font-medium outline-none"
                placeholder="0.0"
                value={toAmount}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
          Connect Wallet
        </button>

        {/* Swap Details */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Rate</span>
              <span>-</span>
            </div>
            <div className="flex justify-between">
              <span>Price Impact</span>
              <span>-</span>
            </div>
            <div className="flex justify-between">
              <span>Network Fee</span>
              <span>-</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 export default SwapComponent;