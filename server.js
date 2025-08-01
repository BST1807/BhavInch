import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
console.log('ENV KEY:', process.env.ONEINCH_API_KEY);

const app = express();
const PORT = 3001;

app.use(cors());

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



app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
