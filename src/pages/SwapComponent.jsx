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

      setBridgeStatus(`✅ Stellar bridge done: ${bridgeRes.data.message}`);
      toast.success('Swap completed on Stellar!');
    } catch (err) {
      console.error('Stellar bridge error:', err.response?.data || err.message);
      toast.error('Failed to bridge to Stellar.');
    } finally {
      setLoadingBridge(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Toaster position="top-right" />

      <div className="bg-gray-900 text-gray-100 rounded-2xl shadow-lg border border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-6">Swap Tokens</h2>

        <div className="space-y-4">
          {/* From Section */}
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex justify-between mb-2 text-sm text-gray-400">
              <span>From</span>
              <span>
                Balance:{' '}
                {fromToken
                  ? (Number(fromToken.balanceRaw) / 10 ** fromToken.decimals).toFixed(4)
                  : '0.00'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <select
                className="w-full max-w-[200px] px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100"
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
                className="w-full max-w-[150px] px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-right text-xl font-medium outline-none text-gray-100"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
              />
            </div>

            <div className="mt-2 flex items-center text-xs text-gray-400 relative group w-max">
              <span className="cursor-pointer">ℹ️</span>
              <div className="absolute left-5 top-full mt-1 w-64 p-2 text-xs text-gray-300 bg-gray-900 border border-gray-700 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10">
                It is recommended to use the native coin of the chain to avoid paying gas fees for approval.
              </div>
            </div>
          </div>

          {/* Swap Arrow */}
          <div className="flex justify-center">
            <button
              type="button"
              className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
              onClick={() => {
                const temp = fromToken;
                setFromToken(toToken);
                setToToken(temp);
                setFromAmount(toAmount);
                setToAmount('');
              }}
            >
              <ArrowLeftRight className="w-5 h-5 text-gray-300 transform rotate-90" />
            </button>
          </div>

          {/* To Section */}
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex justify-between mb-2 text-sm text-gray-400">
              <span>To</span>
              <span>Balance: -</span>
            </div>
            <div className="flex items-center space-x-3">
              <select
                className="w-full max-w-[200px] px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100"
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
                className="w-full max-w-[150px] px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-right text-xl font-medium outline-none text-gray-100"
                placeholder="0.0"
                value={toAmount}
              />
            </div>
          </div>
        </div>

        {!isConnected ? (
          <p className="w-full mt-6 text-center text-gray-400 font-medium">
            Connect your wallet to start swapping.
          </p>
        ) : (
          <>
            <div className="mt-4 p-3 bg-gray-800 rounded-lg text-sm text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>Rate</span>
                <span>
                  {toAmount && fromAmount
                    ? `1 ${fromToken?.symbol} → ${(Number(toAmount) / Number(fromAmount)).toFixed(
                        6
                      )} ${toToken?.symbol}`
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Received</span>
                <span>{toAmount ? `${toAmount} ${toToken?.symbol}` : '-'}</span>
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

            <button
              className={`w-full mt-4 px-4 py-3 rounded-lg text-white ${
                loadingSwap ? 'bg-blue-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
              onClick={handleSwap}
              disabled={loadingSwap}
            >
              {loadingSwap ? 'Getting TX Data...' : 'Get Swap Transaction Data'}
            </button>
          </>
        )}

        {swapTx && (
          <>
            <div className="mt-6 p-4 bg-gray-800 rounded-lg text-xs text-gray-300 space-y-1">
              <div><strong>From:</strong> {swapTx.from}</div>
              <div><strong>To:</strong> {swapTx.to}</div>
              <div><strong>Value:</strong> {swapTx.value} WEI</div>
              <div><strong>Gas:</strong> {swapTx.gas} GAS UNITS</div>
              <div><strong>GasPrice:</strong> {swapTx.gasPrice} WEI</div>
              <div className="break-all"><strong>Data:</strong> {swapTx.data}</div>
            </div>

            <button
              className={`w-full mt-4 px-4 py-3 rounded-lg text-white flex justify-center items-center ${
                loadingBridge
                  ? 'bg-green-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
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
          </>
        )}

        {bridgeStatus && (
          <div className="mt-4 p-3 bg-green-900 text-green-200 rounded-lg text-sm">
            {bridgeStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default SwapComponent;
