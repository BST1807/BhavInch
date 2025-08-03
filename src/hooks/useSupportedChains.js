import { sepolia, polygonMumbai, avalancheFuji } from 'wagmi/chains';
import { polygonAmoy } from '../lib/wagmi.config'; 

export default function useSupportedChains() {
  const chains = [
    { id: sepolia.id, name: sepolia.name },
    { id: polygonMumbai.id, name: polygonMumbai.name },
    { id: avalancheFuji.id, name: avalancheFuji.name },
    { id: polygonAmoy.id, name: polygonAmoy.name },
  ];

  return { chains, loading: false };
}
