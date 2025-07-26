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
