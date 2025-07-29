import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
console.log('ENV KEY:', process.env.ONEINCH_API_KEY);

const app = express();
const PORT = 3001;

app.use(cors());

// Supported chains map (optional, purely for logging or validation)
const CHAINS = {
  1: 'Ethereum',
  56: 'BNB Chain',
  137: 'Polygon',
  10: 'Optimism',
  42161: 'Arbitrum',
  43114: 'Avalanche'
};

// 🔍 SEARCH endpoint
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


// ✅ SPOT PRICE endpoint
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

    res.json(response.data);
    console.log("Spot Price Raw Response:", response.data);

  } catch (err) {
    console.error('Spot price error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch spot price', details: err.message });
  }

  
});




// ✅ PORTFOLIO Current Value endpoint
app.get('/api/portfolio/value', async (req, res) => {
  const { chainId, wallet } = req.query;

  if (!chainId || !wallet) {
    return res.status(400).json({ error: 'chainId and wallet are required' });
  }

  console.log(`[PORTFOLIO VALUE] Chain: ${chainId} | Wallet: ${wallet}`);

  try {
    const response = await axios.get(
      `https://api.1inch.dev/portfolio/portfolio/v4/overview/erc20/current_value`,
      {
        params: {
          addresses: wallet,
          chain_id: chainId,
        },
        headers: {
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error('Portfolio Value API error:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to fetch portfolio value',
      details: err.response?.data || err.message,
    });
  }
});


// ✅ QUOTE endpoint
app.get('/api/quote', async (req, res) => {
  const { chainId, fromTokenAddress, toTokenAddress, amount } = req.query;

  if (!chainId || !fromTokenAddress || !toTokenAddress || !amount) {
    return res.status(400).json({ error: 'Missing required params' });
  }

  console.log(`[QUOTE] Chain: ${chainId} | From: ${fromTokenAddress} | To: ${toTokenAddress} | Amount: ${amount}`);

  try {
    const response = await axios.get(
      `https://api.1inch.dev/swap/v5.2/${chainId}/quote`,
      {
        params: {
          fromTokenAddress,
          toTokenAddress,
          amount
        },
        headers: {
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
        },
      }
    );

    res.json(response.data);
    console.log('1inch raw quote:', response.data);
  } catch (err) {
    console.error('Quote error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch quote', details: err.response?.data || err.message });
  }
});


// ✅ GAS PRICE endpoint
app.get('/api/gas-price', async (req, res) => {
  const { chainId } = req.query;
  const cid = chainId || 1;

  console.log(`[GAS PRICE] Chain: ${cid}`);

  try {
    const response = await axios.get(`https://api.1inch.dev/gas-price/v1.4/${cid}`, {
      headers: {
        Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error('Gas price error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch gas price', details: err.message });
  }
});



// 🔍 ALL TOKENS endpoint
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

    // Response is { [address]: tokenObj }
    // Wrap it:
    res.json({ tokens: response.data });

  } catch (err) {
    console.error('Error fetching all tokens:', err);
    res.status(500).json({ error: 'Failed to fetch all tokens', details: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
