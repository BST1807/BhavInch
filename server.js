import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { setupTrustlinesAndFundDistributor } = require('./server/stellarBridge.cjs');
import StellarSdk from 'stellar-sdk';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
console.log('ENV KEY:', process.env.ONEINCH_API_KEY);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json()); 

// ✅ BALANCES + ALLOWANCES endpoint
app.get('/api/balances', async (req, res) => {
  const { chainId, wallet } = req.query;

  if (!chainId || !wallet) {
    return res.status(400).json({ error: 'chainId and wallet are required' });
  }

  console.log(`[BALANCES] Chain: ${chainId} | Wallet: ${wallet}`);

  try {
    const response = await axios.get(
      `https://api.1inch.dev/balance/v1.2/${chainId}/balances/${wallet}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error('Balances API error:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to fetch balances',
      details: err.response?.data || err.message,
    });
  }
});

// ✅ Spot price → price in native token
app.get('/api/spot-price', async (req, res) => {
  const { chainId, tokenAddress } = req.query;

  if (!chainId || !tokenAddress) {
    return res.status(400).json({ error: 'chainId and tokenAddress are required' });
  }

  console.log(`[SPOT PRICE] Chain: ${chainId} | Token: ${tokenAddress}`);

  try {
    const response = await axios.get(
      `https://api.1inch.dev/price/v1.1/${chainId}/${tokenAddress}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
        },
      }
    );

    const raw = Object.values(response.data)[0];
    const priceInNative = Number(raw) / 1e18;

    console.log("Spot Price Raw:", response.data, "| Native:", priceInNative);

    res.json({ priceInNative });

  } catch (err) {
    console.error('Spot price error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch spot price', details: err.message });
  }
});

// ✅ Native token → USD
app.get('/api/native-price', async (req, res) => {
  const { chainId } = req.query;

  if (!chainId) {
    return res.status(400).json({ error: 'chainId is required' });
  }

  let id = 'ethereum';
  if (chainId === '137') id = 'polygon';
  if (chainId === '56') id = 'binancecoin';

  try {
    const cg = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
      params: { ids: id, vs_currencies: 'usd' },
    });
    const usd = cg.data[id]?.usd || 0;

    console.log(`[NATIVE PRICE] ${id} USD:`, usd);
    res.json({ usd });
  } catch (err) {
    console.error('Native price error:', err.message);
    res.status(500).json({ error: 'Could not fetch native token USD price' });
  }
});

app.get('/api/search-token', async (req, res) => {
  const query = req.query.query;
  const chain = req.query.chainId || 1;
  console.log(`[SEARCH] Chain: ${chain} | Query: ${query}`);

  try {
    const response = await axios.get(
      `https://api.1inch.dev/token/v1.2/${chain}/search`,
      {
        params: { query },
        headers: {
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
        },
      }
    );


    res.json(response.data);

  } catch (err) {
    console.error('Search error:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Search failed',
      details: err.response?.data || err.message,
    });
  }
});


// ✅ All tokens metadata
app.get('/api/all-tokens', async (req, res) => {
  const { chainId } = req.query;

  if (!chainId) {
    return res.status(400).json({ error: 'chainId is required' });
  }

  console.log(`Fetching all tokens for chain ${chainId}...`);

  try {
    const response = await axios.get(`https://api.1inch.dev/token/v1.2/${chainId}`, {
      headers: {
        Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
      },
    });

    res.json({ tokens: response.data });

  } catch (err) {
    console.error('Error fetching all tokens:', err);
    res.status(500).json({ error: 'Failed to fetch all tokens', details: err.message });
  }
});



// ✅ QUOTE endpoint
app.get('/api/quote', async (req, res) => {
  const { chainId, fromTokenAddress, toTokenAddress, amount } = req.query;

  if (!chainId || !fromTokenAddress || !toTokenAddress || !amount) {
    return res.status(400).json({
      error: 'chainId, fromTokenAddress, toTokenAddress, and amount are required'
    });
  }

  console.log(`[QUOTE] Chain: ${chainId} | From: ${fromTokenAddress} | To: ${toTokenAddress} | Amount: ${amount}`);

  try {
    const response = await axios.get(
      `https://api.1inch.dev/swap/v6.0/${chainId}/quote`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
        },
        params: {
          fromTokenAddress,
          toTokenAddress,
          amount,
        }
      }
    );

    res.json(response.data);

  } catch (err) {
    console.error('Quote API error:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to fetch quote',
      details: err.response?.data || err.message,
    });
  }
});



// ✅ GAS PRICE endpoint using 1inch Gas Price API
app.get('/api/gas-price', async (req, res) => {
  const { chainId } = req.query;

  if (!chainId) {
    return res.status(400).json({ error: 'chainId is required' });
  }

  console.log(`[GAS PRICE] Chain: ${chainId}`);

  try {
    const response = await axios.get(
      `https://api.1inch.dev/gas-price/v1.4/${chainId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
        },
      }
    );

    res.json(response.data);

  } catch (err) {
    console.error('Gas price error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch gas price', details: err.message });
  }
});

// ✅ 1inch Portfolio - ERC20 current value proxy
app.get('/api/portfolio', async (req, res) => {
  const { chainId, wallet } = req.query;

  if (!chainId || !wallet) {
    return res.status(400).json({ error: 'chainId and wallet are required' });
  }

  console.log(`[PORTFOLIO] Chain: ${chainId} | Wallet: ${wallet}`);

  try {
    const response = await axios.get(
      `https://api.1inch.dev/portfolio/portfolio/v4/overview/erc20/current_value?addresses=${wallet}&chain_id=${chainId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
        },
      }
    );

    console.log('Portfolio API response:', response.data);

    // Extract only token results
    const tokenResult = response.data.result.find(
      (r) => r.protocol_name === 'token'
    );
    const tokens = tokenResult ? tokenResult.result : [];

    res.json({ tokens });

  } catch (err) {
    console.error('Portfolio API error:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to fetch portfolio',
      details: err.response?.data || err.message,
    });
  }
});


// ✅ 1inch Portfolio - PnL proxy
app.get('/api/portfolio-pnl', async (req, res) => {
  const { chainId, wallet } = req.query;

  if (!chainId || !wallet) {
    return res.status(400).json({ error: 'chainId and wallet are required' });
  }

  console.log(`[PORTFOLIO PnL] Chain: ${chainId} | Wallet: ${wallet}`);

  try {
    const response = await axios.get(
      `https://api.1inch.dev/portfolio/portfolio/v4/overview/erc20/profit_and_loss?addresses=${wallet}&chain_id=${chainId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
        },
      }
    );
    console.log('Portfolio PnL API response:', response.data);
    res.json(response.data);
  } catch (err) {
    console.error('Portfolio PnL API error:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to fetch portfolio PnL',
      details: err.response?.data || err.message,
    });
  }
});


// ✅ 1inch Portfolio - ERC20 balances proxy
app.get('/api/portfolio-balances', async (req, res) => {
  const { chainId, wallet } = req.query;

  if (!chainId || !wallet) {
    return res.status(400).json({ error: 'chainId and wallet are required' });
  }

  console.log(`[PORTFOLIO BALANCES] Chain: ${chainId} | Wallet: ${wallet}`);

  try {
    const response = await axios.get(
      `https://api.1inch.dev/portfolio/portfolio/v4/overview/erc20/balances?addresses=${wallet}&chain_id=${chainId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
        },
      }
    );
    console.log('Portfolio BALANCES API response:', response.data);
    res.json(response.data);
  } catch (err) {
    console.error('Portfolio BALANCES API error:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to fetch portfolio balances',
      details: err.response?.data || err.message,
    });
  }
});


// ✅ SWAP endpoint — returns swap tx data, does NOT broadcast!
app.get('/api/swap', async (req, res) => {
  const { chainId, fromTokenAddress, toTokenAddress, amount, wallet, slippage } = req.query;

  if (!chainId || !fromTokenAddress || !toTokenAddress || !amount || !wallet || !slippage) {
    return res.status(400).json({
      error: 'chainId, fromTokenAddress, toTokenAddress, amount, wallet, and slippage are required'
    });
  }

  console.log(`[SWAP] Chain: ${chainId} | From: ${fromTokenAddress} | To: ${toTokenAddress} | Amount: ${amount} | Wallet: ${wallet} | Slippage: ${slippage}`);

  try {
    const response = await axios.get(
      `https://api.1inch.dev/swap/v6.0/${chainId}/swap`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
        },
        params: {
          src: fromTokenAddress,
          dst: toTokenAddress,
          amount: amount,
          from: wallet,
          slippage: slippage,
        }
      }
    );
    console.log('Swap API response:', response.data);
    res.json(response.data);

  } catch (err) {
    console.error('Swap API error:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to fetch swap transaction data',
      details: err.response?.data || err.message,
    });
  }
});


// ✅ Stellar Bridge Route
app.post('/api/stellar-bridge', async (req, res) => {
  const { tokenName, tokenAmount } = req.body;

  if (!tokenName || !tokenAmount) {
    return res.status(400).json({ error: 'tokenName and tokenAmount are required' });
  }

  try {
    await setupTrustlinesAndFundDistributor(tokenName, tokenAmount);
    res.json({ status: 'OK', message: `Issued ${tokenAmount} ${tokenName} to Alice` });
  } catch (err) {
    console.error('Stellar Bridge error:', err.message);
    res.status(500).json({ error: 'Stellar Bridge failed', details: err.message });
  }
});



app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});

