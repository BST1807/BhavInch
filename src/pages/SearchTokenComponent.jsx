import React, { useState } from 'react';
import axios from 'axios';

const SearchTokenComponent = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const searchToken = async () => {
    if (!query) return;

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/search-token`, {
        params: { query },
      });
      setResult(response.data);
    } catch (error) {
      console.error('Search failed:', error);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Search for a Token</h2>

      <div className="flex items-center space-x-3 mb-6">
        <input
          type="text"
          className="border border-gray-300 rounded px-4 py-3 w-full focus:outline-none focus:ring focus:border-blue-400 text-gray-500"
          placeholder="Enter token name, symbol, or address"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-5 py-3 rounded shadow"
          onClick={searchToken}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {result && result.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Results:</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.map((token) => (
              <li
                key={token.address}
                className="border border-gray-200 rounded-lg p-4 flex items-start space-x-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {token.logoURI && (
                  <img
                    src={token.logoURI}
                    alt={token.symbol}
                    className="w-12 h-12 object-contain rounded"
                  />
                )}
                <div>
                  <p className="font-bold text-gray-800">{token.name}</p>
                  <p className="text-sm text-gray-500 mb-1">Symbol: {token.symbol}</p>
                  <p className="text-sm text-gray-500 mb-1">Decimals: {token.decimals}</p>
                  <p className="text-xs text-gray-400 break-all">
                    {token.address}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : result && (
        <p className="text-gray-500">No tokens found for "{query}".</p>
      )}
    </div>
  );
};

export default SearchTokenComponent;
