import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeftRight } from 'lucide-react';

const SwapComponent = () => {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState(null);
  const [toToken, setToToken] = useState(null);
  const [gasPrice, setGasPrice] = useState(null);

  const tokenList = [
    {
      symbol: 'USDC',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6
    },
    {
      symbol: 'USDT',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6
    },
    {
      symbol: 'DAI',
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      decimals: 18
    }
  ];

  // Fetch quote whenever inputs change
  useEffect(() => {
    const fetchQuote = async () => {
      if (!fromToken || !toToken) return;
      const amt = Number(fromAmount);
      if (!amt || amt <= 0) return;

      const amountInWei = BigInt(Math.floor(amt * 10 ** fromToken.decimals)).toString();
      console.log(`[QUOTE] Chain: 1 | From: ${fromToken.address} | To: ${toToken.address} | Amount: ${amountInWei}`);

      try {
        const response = await axios.get('http://localhost:3001/api/quote', {
          params: {
            chainId: 1,
            fromTokenAddress: fromToken.address,
            toTokenAddress: toToken.address,
            amount: amountInWei,
          },
        });

        const toAmountRaw = response.data.toAmount || response.data.toTokenAmount;
        console.log('Raw toAmount:', toAmountRaw);

        if (toAmountRaw && toToken) {
          const formatted = Number(toAmountRaw) / 10 ** toToken.decimals;
          console.log('Formatted:', formatted);
          setToAmount(formatted.toFixed(6));
        } else {
          setToAmount('');
        }
      } catch (err) {
        console.error('Quote error:', err.response?.data || err.message);
        setToAmount('');
      }
    };

    fetchQuote();
  }, [fromAmount, fromToken, toToken]);

  // Fetch gas price once
  useEffect(() => {
    const fetchGasPrice = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/gas-price', {
          params: { chainId: 1 }
        });
        console.log('Gas price:', response.data);
        setGasPrice(response.data);
      } catch (err) {
        console.error('Gas price error:', err.response?.data || err.message);
      }
    };
    fetchGasPrice();
  }, []);

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Swap Tokens</h2>

        <div className="space-y-4">
          {/* From Token */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">From</span>
              <span className="text-sm text-gray-600">Balance: 0.00</span>
            </div>
            <div className="flex items-center space-x-3">
              <select
                className="px-3 py-2 border border-gray-200 rounded-lg text-gray-900"
                value={fromToken?.address || ''}
                onChange={(e) => {
                  const selected = tokenList.find(t => t.address === e.target.value);
                  setFromToken(selected);
                }}
              >
                <option value="">Select Token</option>
                {tokenList.map(token => (
                  <option key={token.address} value={token.address}>{token.symbol}</option>
                ))}
              </select>

              <input
                type="number"
                min="0"
                step="any"
                className="flex-1 bg-transparent text-right text-xl font-medium outline-none text-gray-900"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Swap Arrow */}
          <div className="flex justify-center">
            <button
              type="button"
              className="p-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              onClick={() => {
                const temp = fromToken;
                setFromToken(toToken);
                setToToken(temp);
                setFromAmount(toAmount);
                setToAmount('');
              }}
            >
              <ArrowLeftRight className="w-5 h-5 text-gray-600 transform rotate-90" />
            </button>
          </div>

          {/* To Token */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">To</span>
              <span className="text-sm text-gray-600">Balance: 0.00</span>
            </div>
            <div className="flex items-center space-x-3">
              <select
                className="px-3 py-2 border border-gray-200 rounded-lg text-gray-900"
                value={toToken?.address || ''}
                onChange={(e) => {
                  const selected = tokenList.find(t => t.address === e.target.value);
                  setToToken(selected);
                }}
              >
                <option value="">Select Token</option>
                {tokenList.map(token => (
                  <option key={token.address} value={token.address}>{token.symbol}</option>
                ))}
              </select>

              <input
                type="text"
                className="flex-1 bg-transparent text-right text-xl font-medium outline-none text-gray-900"
                placeholder="0.0"
                value={toAmount}
                readOnly
              />
            </div>
          </div>
        </div>

        <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors">
          Connect Wallet
        </button>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Rate</span>
              <span>{toAmount ? `1 ${fromToken?.symbol} → ${Number(toAmount) / Number(fromAmount)} ${toToken?.symbol}` : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span>Gas Price</span>
              <span>
                {gasPrice
                  ? `${(Number(gasPrice.medium.maxFeePerGas) / 1e9).toFixed(2)} Gwei`
                  : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapComponent;
