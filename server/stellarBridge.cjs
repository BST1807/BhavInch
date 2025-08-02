const StellarSdk = require('stellar-sdk');

// 🔗 Connect to testnet
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
StellarSdk.Networks.TESTNET;

// ✅ Replace with your real testnet secret keys
const ISSUER_SECRET = 'SBJX7G2UOBL6L5A2UQF3ELPFUNPGRP7RQ3DK6CBQL5NPLMKONU2GWMHV';
const ALICE_SECRET = 'SCGDC4VXTNMKDGI4ZJSBKD2FFHD4WS2ODYEDRIUZXMPT5IJQKAOR3UP7';
const BOB_SECRET   = 'SAXKFCM56JFF3GWVDGXVJCQVZPRFRRAQW6ZPCPYTO6B2VF4JCR7CYDAV';

const issuerKeypair = StellarSdk.Keypair.fromSecret(ISSUER_SECRET);
const aliceKeypair  = StellarSdk.Keypair.fromSecret(ALICE_SECRET);
const bobKeypair    = StellarSdk.Keypair.fromSecret(BOB_SECRET);

async function setupTrustlinesAndFundDistributor(tokenName, tokenAmount) {
  const customAsset = new StellarSdk.Asset(tokenName, issuerKeypair.publicKey());

  // 1️⃣ Alice trusts
  let aliceAccount = await server.loadAccount(aliceKeypair.publicKey());
  const aliceTrustTx = new StellarSdk.TransactionBuilder(aliceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET
  })
    .addOperation(StellarSdk.Operation.changeTrust({ asset: customAsset }))
    .setTimeout(100)
    .build();
  aliceTrustTx.sign(aliceKeypair);
  await server.submitTransaction(aliceTrustTx);
  console.log(`✅ Alice trusts ${tokenName}`);

  // 2️⃣ Bob trusts
  let bobAccount = await server.loadAccount(bobKeypair.publicKey());
  const bobTrustTx = new StellarSdk.TransactionBuilder(bobAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET
  })
    .addOperation(StellarSdk.Operation.changeTrust({ asset: customAsset }))
    .setTimeout(100)
    .build();
  bobTrustTx.sign(bobKeypair);
  await server.submitTransaction(bobTrustTx);
  console.log(`✅ Bob trusts ${tokenName}`);

  // 3️⃣ Issuer sends to Alice
  let issuerAccount = await server.loadAccount(issuerKeypair.publicKey());
  const paymentTx = new StellarSdk.TransactionBuilder(issuerAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET
  })
    .addOperation(StellarSdk.Operation.payment({
      destination: aliceKeypair.publicKey(),
      asset: customAsset,
      amount: tokenAmount.toString(),
    }))
    .setTimeout(100)
    .build();
  paymentTx.sign(issuerKeypair);
  await server.submitTransaction(paymentTx);
  console.log(`✅ Issuer sent ${tokenAmount} ${tokenName} to Alice`);
}

module.exports = {
  setupTrustlinesAndFundDistributor,
};
