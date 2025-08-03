import React from 'react';

const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl border border-gray-200">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">About BhavInch</h1>

      <p className="text-gray-700 leading-relaxed mb-4">
        <span className="font-semibold">BhavInch</span> bridges EVM-based DeFi with Stellar’s
        ultra-fast, low-fee rails to deliver seamless cross-chain swaps and instant global remittance.
        Users connect their wallet to view an on-chain portfolio — real-time ERC-20 balances,
        USD valuations, PnL/ROI breakdown, and detailed token metadata via 1inch’s Balance,
        Portfolio, Token, and Price APIs.
      </p>

      <p className="text-gray-700 leading-relaxed mb-4">
        They can search any token across networks using 1inch’s Token Search API.
        On the Swap page, selecting “From” & “To” assets triggers 1inch’s Classic Swap
        and Gas Price APIs to quote the best rates, display the exchange rate,
        estimated received amount, and gas cost, then generate the unsigned swap transaction payload.
      </p>

      <p className="text-gray-700 leading-relaxed mb-6">
        Once reviewed, a separate <span className="font-semibold">“Swap on Stellar”</span> button
        mints a pegged custom asset (named after the destination token) on the Stellar testnet —
        automatically setting up trustlines and issuing the bridged amount via our Stellar Bridge service —
        delivering funds instantly to a recipient’s Stellar address. This showcases a full
        <span className="font-semibold"> “Swap → Bridge → Remit” </span>
        workflow that leverages both 1inch’s DEX aggregation and Stellar’s programmable digital assets.
      </p>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">1inch APIs & Endpoints Used</h2>

      <ul className="space-y-4">
        <li className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="font-semibold text-gray-800 mb-1">Balance API:</p>
          <code className="block text-sm text-blue-600 break-all">
            https://api.1inch.dev/balance/v1.2/&#123;chainId&#125;/balances/&#123;wallet&#125;
          </code>
        </li>

        <li className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="font-semibold text-gray-800 mb-1">Token API:</p>
          <code className="block text-sm text-blue-600 break-all">
            https://api.1inch.dev/token/v1.2/&#123;chainId&#125;
          </code>
          <code className="block text-sm text-blue-600 break-all">
            https://api.1inch.dev/token/v1.2/&#123;chain&#125;/search
          </code>
        </li>

        <li className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="font-semibold text-gray-800 mb-1">Swap API:</p>
          <code className="block text-sm text-blue-600 break-all">
            https://api.1inch.dev/swap/v6.0/&#123;chainId&#125;/quote
          </code>
          <code className="block text-sm text-blue-600 break-all">
            https://api.1inch.dev/swap/v6.0/&#123;chainId&#125;/swap
          </code>
        </li>

        <li className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="font-semibold text-gray-800 mb-1">Gas Price API:</p>
          <code className="block text-sm text-blue-600 break-all">
            https://api.1inch.dev/gas-price/v1.4/&#123;chainId&#125;
          </code>
        </li>

        <li className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="font-semibold text-gray-800 mb-1">Portfolio API:</p>
          <code className="block text-sm text-blue-600 break-all">
            https://api.1inch.dev/portfolio/portfolio/v4/overview/erc20/details
          </code>
        </li>

        <li className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="font-semibold text-gray-800 mb-1">Spot Price API:</p>
          <code className="block text-sm text-blue-600 break-all">
            https://api.1inch.dev/price/v1.1/&#123;chainId&#125;/&#123;tokenAddress&#125;
          </code>
        </li>
      </ul>
    </div>
  );
};

export default AboutPage;
