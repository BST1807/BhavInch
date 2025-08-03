import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// RainbowKit + Wagmi imports
import '@rainbow-me/rainbowkit/styles.css';
import { WagmiProvider } from 'wagmi';
import { config } from './lib/wagmi.config';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

// ✅ Add QueryClientProvider + QueryClient
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Your components
import Header from './components/Header';
import SwapComponent from './pages/SwapComponent';
import PortfolioComponent from './pages/Portfolio';
import WalletComponent from './pages/WalletComponent';
import SearchTokenComponent from './pages/SearchTokenComponent';

// ✅ Create QueryClient once
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Header />

              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Routes>
                  <Route path="/" element={<Navigate to="/swap" replace />} />
                  <Route path="/swap" element={<SwapComponent />} />
                  <Route path="/portfolio" element={<PortfolioComponent />} />
                  <Route path="/wallet" element={<WalletComponent />} />
                  <Route path="/search" element={<SearchTokenComponent />} />
                </Routes>
              </main>

              <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                  <div className="text-center text-sm text-gray-600">
                    <p>BhavInch - Built with 1inch API & Stellar</p>
                    
                  </div>
                </div>
              </footer>
            </div>
          </Router>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
};

export default App;
