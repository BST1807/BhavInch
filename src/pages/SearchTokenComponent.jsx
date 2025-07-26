import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CHAINS = [
  { id: 1, name: 'Ethereum' },
  { id: 56, name: 'BNB Chain' },
  { id: 137, name: 'Polygon' },
  { id: 10, name: 'Optimism' },
  { id: 42161, name: 'Arbitrum' },
  { id: 43114, name: 'Avalanche' },
];

const SearchTokenComponent = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState([]);
  const [allTokens, setAllTokens] = useState([]);
  const [selectedChain, setSelectedChain] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchAllTokens = async (chainId) => {
    try {
      const response = await axios.get('http://localhost:3001/api/all-tokens', {
        params: { chainId },
      });
      console.log('Tokens API response:', response.data);

      const tokensArray = response.data.tokens
        ? Array.isArray(response.data.tokens)
          ? response.data.tokens
          : Object.values(response.data.tokens)
        : [];

      setAllTokens(tokensArray);
      setResult(tokensArray);
    } catch (error) {
      console.error('Failed to load all tokens:', error);
      setAllTokens([]);
      setResult([]);
    }
  };

  useEffect(() => {
    fetchAllTokens(selectedChain);
  }, [selectedChain]);

  const searchToken = async () => {
    if (!query) {
      setResult(allTokens);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/search-token', {
        params: { query, chainId: selectedChain },
      });
      setResult(response.data);
    } catch (error) {
      console.error('Search failed:', error);
      setResult([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">🔍 Search for a Token</h2>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <select
          className="border border-gray-300 rounded px-4 py-2 shadow-sm focus:ring focus:ring-blue-200 text-gray-700"
          value={selectedChain}
          onChange={(e) => setSelectedChain(Number(e.target.value))}
        >
          {CHAINS.map((chain) => (
            <option key={`chain-${chain.id}`} value={chain.id}>
              {chain.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          className="flex-grow border border-gray-300 rounded px-4 py-2 shadow-sm focus:ring focus:ring-blue-200 text-gray-700"
          placeholder="Enter token name, symbol, or address"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow-sm transition ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={searchToken}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {result && result.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {result.map((token) => (
            <div
              key={token.address}
              className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center space-x-3 mb-3">
                {token.logoURI ? (
                  <img
                    src={token.logoURI}
                    alt={token.symbol}
                    className="w-8 h-8 rounded-full border"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-500">
                    ?
                  </div>
                )}
                <h4 className="text-lg font-semibold text-gray-800">{token.name}</h4>
              </div>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Symbol:</span> {token.symbol}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Decimals:</span> {token.decimals}
              </p>
              <p className="text-gray-600 break-words text-sm">
                <span className="font-medium">Address:</span> {token.address}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">No tokens found.</p>
      )}
    </div>
  );
};

export default SearchTokenComponent;
