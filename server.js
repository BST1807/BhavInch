import express from 'express';
import cors from 'cors';
import axios from 'axios'; // ✅ using axios now!
import dotenv from 'dotenv';

dotenv.config();
console.log('ENV KEY:', process.env.ONEINCH_API_KEY);

const app = express();
const PORT = 3001;

app.use(cors());

app.get('/api/search-token', async (req, res) => {
  const query = req.query.query;
  console.log('Incoming query:', query);
  console.log('API key:', process.env.ONEINCH_API_KEY);

  try {
    const response = await axios.get(
      `https://api.1inch.dev/token/v1.2/1/search`,
      {
        params: { query },
        headers: {
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`, // ✅ CORRECT
        },
      }
    );

    console.log('1inch response:', response.data);
    res.json(response.data);

  } catch (err) {
    console.error('Proxy error:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Something went wrong',
      details: err.response?.data || err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server listening on http://localhost:${PORT}`);
});
