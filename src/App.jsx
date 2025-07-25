import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header'; // <-- Put your Header in its own file if not already
import SwapComponent from './components/SwapComponent'; // same for others
import PortfolioComponent from './components/Portfolio';
import WalletComponent from './components/WalletComponent';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/swap" replace />} />
            <Route path="/swap" element={<SwapComponent />} />
            <Route path="/portfolio" element={<PortfolioComponent />} />
            <Route path="/wallet" element={<WalletComponent />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-sm text-gray-600">
              <p>DeFiSwap - Built with React & 1inch API</p>
              <p className="mt-1">Environment: {import.meta.env.NODE_ENV || 'development'}</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
