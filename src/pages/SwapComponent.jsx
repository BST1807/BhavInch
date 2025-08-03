import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAccount, useChainId } from 'wagmi';
import { ArrowLeftRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const SwapComponent = () => {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState(null);
  const [toToken, setToToken] = useState(null);
  const [gasPrice, setGasPrice] = useState(null);
  const [tokenList, setTokenList] = useState([]);
  const [allTokenList, setAllTokenList] = useState([]);
  const [swapTx, setSwapTx] = useState(null);
  const [bridgeStatus, setBridgeStatus] = useState(null);

  const [loadingSwap, setLoadingSwap] = useState(false);
  const [loadingBridge, setLoadingBridge] = useState(false);

  const { address: walletAddress, isConnected } = useAccount();
  const chainId = useChainId() || 1;

  useEffect(() => {
    const fetchData = async () => {
      if (!walletAddress || !chainId) return;

      try {
        const balancesRes = await axios.get('http://localhost:3001/api/balances', {
          params: { chainId, wallet: walletAddress },
        });

        const balances = balancesRes.data.balances || balancesRes.data;

        const nonZeroTokens = Object.entries(balances)
          .filter(([address, balance]) => BigInt(balance) > 0n)
          .map(([address, balance]) => ({ address, balance }));

        const allTokensRes = await axios.get('http://localhost:3001/api/all-tokens', {
          params: { chainId },
        });

        const allTokens = allTokensRes.data.tokens;

        const userTokens = nonZeroTokens
          .map(({ address, balance }) => {
            const tokenInfo = allTokens[address.toLowerCase()];
            if (!tokenInfo) return null;
            return {
              symbol: tokenInfo.symbol,
              name: tokenInfo.name,
              address: tokenInfo.address,
              decimals: tokenInfo.decimals,
              balanceRaw: balance,
            };
          })
          .filter(Boolean);

        const allTokensArray = Object.values(allTokens).map((token) => ({
          symbol: token.symbol,
          name: token.name,
          address: token.address,
          decimals: token.decimals,
        }));

        setTokenList(userTokens);
        setAllTokenList(allTokensArray);
      } catch (err) {
        console.error('Balances or tokens error:', err.response?.data || err.message);
      }
    };

    fetchData();
  }, [walletAddress, chainId]);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!fromToken || !toToken || !chainId) return;
      const amt = Number(fromAmount);
      if (!amt || amt <= 0) return;

      const amountInWei = BigInt(Math.floor(amt * 10 ** fromToken.decimals)).toString();

      try {
        const response = await axios.get('http://localhost:3001/api/quote', {
          params: {
            chainId,
            fromTokenAddress: fromToken.address,
            toTokenAddress: toToken.address,
            amount: amountInWei,
          },
        });

        const toAmountRaw =
          response.data.dstAmount ||
          response.data.data?.dstAmount ||
          response.data.toAmount ||
          response.data.toTokenAmount;

        if (toAmountRaw && toToken) {
          const formatted = Number(toAmountRaw) / 10 ** toToken.decimals;
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
  }, [fromAmount, fromToken, toToken, chainId]);

  useEffect(() => {
    const fetchGasPrice = async () => {
      if (!chainId) return;
      try {
        const response = await axios.get('http://localhost:3001/api/gas-price', {
          params: { chainId },
        });
        setGasPrice(response.data);
      } catch (err) {
        console.error('Gas price error:', err.response?.data || err.message);
      }
    };
    fetchGasPrice();
  }, [chainId]);

  const handleSwap = async () => {
    if (!fromToken || !toToken || !walletAddress || !chainId) return;

    const amt = Number(fromAmount);
    if (!amt || amt <= 0) return;

    const amountInWei = BigInt(Math.floor(amt * 10 ** fromToken.decimals)).toString();

    try {
      setLoadingSwap(true);

      const response = await axios.get('http://localhost:3001/api/swap', {
        params: {
          chainId,
          fromTokenAddress: fromToken.address,
          toTokenAddress: toToken.address,
          amount: amountInWei,
          wallet: walletAddress,
          slippage: 1,
        },
      });

      setSwapTx(response.data.tx);
      toast.success('Transaction data generated!');
    } catch (err) {
      console.error('Swap API error:', err.response?.data || err.message);
      toast.error('Failed to get transaction data.');
    } finally {
      setLoadingSwap(false);
    }
  };

  const handleStellarBridge = async () => {
    if (!toAmount || !toToken?.symbol) {
      console.error('No valid amount or token for Stellar bridge.');
      return;
    }

    try {
      setLoadingBridge(true);

      const bridgeRes = await axios.post('http://localhost:3001/api/stellar-bridge', {
        tokenName: toToken.symbol,
        tokenAmount: toAmount,
      });

      setBridgeStatus(`✅ Stellar bridge done: Issued ${toAmount} ${toToken.symbol} to Alice (Your account on Stellar Testnet)`);
      toast.success('Swap completed on Stellar!');
    } catch (err) {
      console.error('Stellar bridge error:', err.response?.data || err.message);
      toast.error('Failed to bridge to Stellar.');
    } finally {
      setLoadingBridge(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Toaster position="top-center" />

      {/* Swap Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Swap Tokens</h2>

        <div className="space-y-4">
          {/* From Section */}
          <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
            <div className="flex justify-between mb-3 text-sm text-gray-600">
              <span className="font-medium">From</span>
              <span>
                Balance:{' '}
                {fromToken
                  ? (Number(fromToken.balanceRaw) / 10 ** fromToken.decimals).toFixed(4)
                  : '0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <select
                className="w-64 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-500 transition-colors"
                value={fromToken?.address || ''}
                onChange={(e) => {
                  const selected = tokenList.find(
                    (t) => t.address.toLowerCase() === e.target.value.toLowerCase()
                  );
                  setFromToken(selected);
                }}
              >
                <option value="">Select Token</option>
                {tokenList.map((token) => (
                  <option key={token.address} value={token.address}>
                    {token.symbol} ({token.name})
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="0"
                step="any"
                className="w-32 px-3 py-3 bg-white border border-gray-300 rounded-lg text-right text-xl font-medium text-gray-900 shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-500 transition-colors outline-none"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
              />
            </div>

            <div className="mt-3 flex items-center text-xs text-gray-500 relative group w-max">
              <span className="cursor-pointer">ℹ️</span>
              <div className="absolute left-5 top-full mt-1 w-64 p-3 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                It is recommended to use the native coin of the chain to avoid paying gas fees for approval.
              </div>
            </div>
          </div>

          {/* Swap Arrow */}
          <div className="flex justify-center">
            <button
              type="button"
              className="p-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors shadow-sm"
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

          {/* To Section */}
          <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
            <div className="flex justify-between mb-3 text-sm text-gray-600">
              <span className="font-medium">To</span>
              <span>Balance: -</span>
            </div>
            <div className="flex items-center justify-between">
              <select
                className="w-64 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-500 transition-colors"
                value={toToken?.address || ''}
                onChange={(e) => {
                  const selected = allTokenList.find(
                    (t) => t.address.toLowerCase() === e.target.value.toLowerCase()
                  );
                  setToToken(selected);
                }}
              >
                <option value="">Select Token</option>
                {allTokenList.map((token) => (
                  <option key={token.address} value={token.address}>
                    {token.symbol} ({token.name})
                  </option>
                ))}
              </select>

              <input
                type="text"
                readOnly
                className="w-32 px-3 py-3 bg-gray-100 border border-gray-300 rounded-lg text-right text-xl font-medium text-gray-900 shadow-sm outline-none"
                placeholder="0.0"
                value={toAmount}
              />
            </div>
          </div>
        </div>

        {!isConnected ? (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl text-center">
            <p className="text-blue-800 font-medium">Connect your wallet to start swapping.</p>
          </div>
        ) : (
          <>
            {/* Swap Details */}
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-sm text-gray-700 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Rate</span>
                <span className="text-gray-900">
                  {toAmount && fromAmount
                    ? `1 ${fromToken?.symbol} → ${(Number(toAmount) / Number(fromAmount)).toFixed(
                        6
                      )} ${toToken?.symbol}`
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Estimated Received</span>
                <span className="text-gray-900">{toAmount ? `${toAmount} ${toToken?.symbol}` : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Gas Price</span>
                <span className="text-gray-900">
                  {gasPrice
                    ? `${(Number(gasPrice.medium.maxFeePerGas) / 1e9).toFixed(2)} Gwei`
                    : '-'}
                </span>
              </div>
            </div>

            <button
              className={`w-full mt-6 px-6 py-3 rounded-lg text-white font-medium shadow-sm transition-colors ${
                loadingSwap 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring focus:ring-blue-200'
              }`}
              onClick={handleSwap}
              disabled={loadingSwap}
            >
              {loadingSwap ? 'Getting TX Data...' : 'Get Swap Transaction Data'}
            </button>
          </>
        )}

        {/* Transaction Details */}
        {swapTx && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl text-xs text-gray-700 space-y-2">
            <h4 className="font-semibold text-purple-800 mb-3">Transaction Details</h4>
            <div><span className="font-medium">From:</span> {swapTx.from}</div>
            <div><span className="font-medium">To:</span> {swapTx.to}</div>
            <div><span className="font-medium">Value:</span> {swapTx.value} WEI</div>
            <div><span className="font-medium">Gas:</span> {swapTx.gas} GAS UNITS</div>
            <div><span className="font-medium">GasPrice:</span> {swapTx.gasPrice} WEI</div>
            <div className="break-all"><span className="font-medium">Data:</span> {swapTx.data}</div>
          </div>
        )}

        {/* Stellar Bridge Button */}
        {swapTx && (
          <button
            className={`w-full mt-4 px-6 py-3 rounded-lg text-white font-medium shadow-sm transition-colors flex justify-center items-center ${
              loadingBridge
                ? 'bg-green-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 focus:ring focus:ring-green-200'
            }`}
            onClick={handleStellarBridge}
            disabled={loadingBridge || !swapTx || !toAmount}
          >
            {loadingBridge && (
              <svg
                className="animate-spin h-5 w-5 text-white mr-2"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
            )}
            {loadingBridge ? 'Bridging to Stellar...' : 'Swap on Stellar'}
          </button>
        )}

        {/* Bridge Status */}
        {bridgeStatus && (
          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
            <p className="text-green-800 font-medium">{bridgeStatus}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwapComponent;