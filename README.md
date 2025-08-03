# BhavInch

This dApp bridges EVM‐based DeFi with Stellar’s ultra‐fast, low‐fee rails to deliver seamless cross-chain swaps and instant global remittance. Users connect their wallet to view an on-chain portfolio—real-time ERC-20 balances, USD valuations, PnL/ROI breakdown and detailed token metadata via 1inch’s Balance, Portfolio, Token and Price APIs. They can search any token across networks using 1inch’s Token Search API. On the Swap page, selecting “From” & “To” assets triggers 1inch’s Classic Swap + Gas Price APIs to quote best rates, display exchange rate, estimated received amount, and gas cost, then generate the unsigned swap transaction payload. Once reviewed, a separate “Swap on Stellar” button mints a pegged custom asset (named after the destination token) on the Stellar testnet—automatically setting up trustlines and issuing the bridged amount via our Stellar Bridge service—and delivers funds instantly to a recipient’s Stellar address, showcasing a full “Swap → Bridge → Remit” workflow that leverages both 1inch’s DEX aggregation and Stellar’s programmable digital assets.

1Inch Api's and endpoints used:

1.BALANCE API
Endpoints: https://api.1inch.dev/balance/v1.2/${chainId}/balances/${wallet}

2.TOKEN API
Endpoints:  https://api.1inch.dev/token/v1.2/${chainId}, 
	    https://api.1inch.dev/token/v1.2/${chain}/search

3.SWAP API
Endpoints: https://api.1inch.dev/swap/v6.0/${chainId}/quote, 
	   https://api.1inch.dev/swap/v6.0/${chainId}/swap

4.GAS PRICE API
Endpoints: https://api.1inch.dev/gas-price/v1.4/${chainId}

5.PORTFOLIO API
Endpoints: https://api.1inch.dev/portfolio/portfolio/v4/overview/erc20/details

6.SPOT PRICE API
Endpoints: https://api.1inch.dev/price/v1.1/${chainId}/${tokenAddress}

## HOW TO RUN THE PROJECT:

MAKE SURE YOU HAVE ANY CRYPTOCURRENCY WALLET(Eg: METAMASK) AND YOUR ADDRESS HAVE SOME REAL TOKENS ON ETHEREUM OR POLYGON MAINNET.
TO SHOW THE TRANSACTION ON STELLAR TESTNET, I HAVE CREATED TWO ACCOUNTS ON STELLAR TESTNET:
ALICE: IT WILL ACT AS OUR WALLET IN WHICH SWAPPED TOKENS WILL BE BRIDGED, SECRET KEY: SCGDC4VXTNMKDGI4ZJSBKD2FFHD4WS2ODYEDRIUZXMPT5IJQKAOR3UP7
BOB: I HAVE ESTABLISHED TRUSTLINE OF BRIDGED TOKEN WITH THIS TESTNET ACCOUNT, SO YOU CAN PERFORM TESTNET TRANSACTION OF BRIDGET TOKEN WITH ADDRESS, SECRET KEY: SAXKFCM56JFF3GWVDGXVJCQVZPRFRRAQW6ZPCPYTO6B2VF4JCR7CYDAV
ISSUER: IN CASE YOU NEED THIS: SECRET KEY: SBJX7G2UOBL6L5A2UQF3ELPFUNPGRP7RQ3DK6CBQL5NPLMKONU2GWMHV


1) CREATE A FOLDER, OPEN IT WITH CODE EDITOR(VS CODE) , ON ITS TERMIINAL RUN THE COMMAND: git clone https://github.com/BST1807/BhavInch
2) IN THE TERMINAL , GO TO THE ROOT OF THE CLONED CONTENT, RUN npm install
3) RUN THE COMMAND: npm run start:server, it will start the server.js on port 3000.
4) ADD A NEW TERMINAl AND RUN THE COMMAND: npm run dev , go to the link shown.
