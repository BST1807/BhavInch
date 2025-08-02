import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAccount, useChainId } from 'wagmi';
import { ArrowLeftRight } from 'lucide-react';

const SwapComponent = () => {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState(null);
  const [toToken, setToToken] = useState(null);
  const [gasPrice, setGasPrice] = useState(null);
  const [tokenList, setTokenList] = useState([]);
  const [allTokenList, setAllTokenList] = useState([]);
  const [swapTx, setSwapTx] = useState(null); // ✅ store just tx

  const { address: walletAddress, isConnected } = useAccount();
  const chainId = useChainId() || 1;

  // Fetch balances & tokens
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

  // Quote
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

        console.log('[QUOTE] Raw:', response.data);

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

  // Gas price
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
      const response = await axios.get('http://localhost:3001/api/swap', {
        params: {
          chainId,
          fromTokenAddress: fromToken.address,
          toTokenAddress: toToken.address,
          amount: amountInWei,
          wallet: walletAddress,
          slippage: 1, // 1% slippage
        },
      });

      console.log('[SWAP] Tx:', response.data.tx);
      setSwapTx(response.data.tx); // ✅ just store tx

    } catch (err) {
      console.error('Swap API error:', err.response?.data || err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Swap Tokens</h2>

        <div className="space-y-4">
          {/* From Token */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">From</span>
              <span className="text-sm text-gray-600">
                Balance:{' '}
                {fromToken
                  ? (Number(fromToken.balanceRaw) / 10 ** fromToken.decimals).toFixed(4)
                  : '0.00'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <select
                className="px-3 py-2 border border-gray-200 rounded-lg text-gray-900"
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
              <span className="text-sm text-gray-600">Balance: -</span>
            </div>
            <div className="flex items-center space-x-3">
              <select
                className="px-3 py-2 border border-gray-200 rounded-lg text-gray-900"
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
                className="flex-1 bg-transparent text-right text-xl font-medium outline-none text-gray-900"
                placeholder="0.0"
                value={toAmount}
                readOnly
              />
            </div>
          </div>
        </div>

        {!isConnected ? (
          <p className="w-full mt-6 text-center text-gray-600 font-medium">
            Connect your wallet to start swapping.
          </p>
        ) : (
          <>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 space-y-1">
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
              className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={handleSwap}
            >
              Get Swap Transaction Data
            </button>
          </>
        )}

        {swapTx && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-800 space-y-1">
            <div><strong>From:</strong> {swapTx.from}</div>
            <div><strong>To:</strong> {swapTx.to}</div>
            <div><strong>Value:</strong> {swapTx.value} WEI</div>
            <div><strong>Gas:</strong> {swapTx.gas} GAS UNITS</div>
            <div><strong>GasPrice:</strong> {swapTx.gasPrice} WEI</div>
            <div className="break-all"><strong>Data:</strong> {swapTx.data}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwapComponent;
