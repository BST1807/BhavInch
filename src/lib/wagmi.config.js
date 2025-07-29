import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, polygonMumbai, avalancheFuji ,mainnet ,polygon} from 'wagmi/chains';
import { defineChain } from 'viem';

// ✅ Define Polygon Amoy Testnet manually
export const polygonAmoy = defineChain({
  id: 80002,
  name: 'Polygon Amoy',
  network: 'polygon-amoy',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-amoy.polygon.technology/'],
    },
  },
  blockExplorers: {
    default: { name: 'PolygonScan', url: 'https://amoy.polygonscan.com' },
  },
});

export const config = getDefaultConfig({
  appName: 'BhavInch',
  projectId: '78c6569c263ca3ceb987de960b32f366',
  chains: [sepolia, polygonMumbai, avalancheFuji, polygonAmoy, mainnet, polygon], // ✅ Added here
});
