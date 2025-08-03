// ✅ components/TokenDetailModal.jsx
import React from "react";

export default function TokenDetailModal({ isOpen, onClose, token }) {
  if (!isOpen || !token) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(token.contract_address);
      alert("Token address copied to clipboard!");
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-gray-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ✕
        </button>

        {/* Token Name */}
        <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
          {token.name}
        </h2>
        <h3 className="text-md font-medium text-gray-600 mb-4">
          ({token.symbol})
        </h3>

        {/* Address + Copy */}
        <div className="flex items-center mb-4">
          <span className="text-sm font-mono text-gray-500 break-all">
            {token.contract_address}
          </span>
          <button
            onClick={handleCopy}
            className="ml-2 px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition"
          >
            Copy
          </button>
        </div>

        {/* Explorer Link */}
        <a
          href={`https://etherscan.io/token/${token.contract_address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm text-blue-600 underline mb-4"
        >
          View on Etherscan ↗
        </a>

        {/* Stats */}
        <div className="space-y-2 text-gray-800">
          <p>
            <span className="font-semibold">Balance:</span>{" "}
            {Number(token.amount).toFixed(4)}
          </p>
          <p>
            <span className="font-semibold">USD Value:</span>{" "}
            ${Number(token.value_usd).toFixed(2)}
          </p>
          <p
            className={`font-semibold ${
              token.abs_profit_usd >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            PnL: {token.abs_profit_usd >= 0 ? "+" : "-"}$
            {Math.abs(token.abs_profit_usd).toFixed(2)}
          </p>
          <p
            className={`font-semibold ${
              token.roi >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            ROI: {token.roi >= 0 ? "+" : "-"}
            {(Math.abs(token.roi) * 100).toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
}
