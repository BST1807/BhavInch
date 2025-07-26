import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useSupportedChains() {
  const [chains, setChains] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChains = async () => {
      try {
        const response = await axios.get('https://api.1inch.dev/networks/v1', {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_ONEINCH_API_KEY}`,
          },
        });
        setChains(response.data);
      } catch (err) {
        console.error('Error fetching supported chains:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChains();
  }, []);

  return { chains, loading };
}
