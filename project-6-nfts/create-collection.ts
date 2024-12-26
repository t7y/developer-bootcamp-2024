import {
  createNft,
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { Connection, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import {
  generateSigner,
  keypairIdentity,
  percentAmount,
} from "@metaplex-foundation/umi";

const connection = new Connection(clusterApiUrl("devnet"));

// @ts-ignore
const user = await getKeypairFromFile();

// @ts-ignore
await airdropIfRequired(
  connection,
  user.publicKey,
  1 * LAMPORTS_PER_SOL, // airdrop amount
  0.5 * LAMPORTS_PER_SOL // min balance
);

console.log("Loaded user", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance for user");

const collectionMint = generateSigner(umi);

// @ts-ignore
const transaction = await createNft(umi, {
  mint: collectionMint,
  name: "Leo Collection",
  symbol: "LEOC",
  uri: "https://raw.githubusercontent.com/t7y/developer-bootcamp-2024/refs/heads/main/project-6-nfts/assets/sample-nft-offchain-data.json",
  sellerFeeBasisPoints: percentAmount(0),
  isCollection: true,
});
// @ts-ignore
await transaction.sendAndConfirm(umi);

// @ts-ignore
const createdCollectionNft = await fetchDigitalAsset(
  umi,
  collectionMint.publicKey
);

console.log(
  `Created Collection 📦! Address is ${getExplorerLink(
    "address",
    createdCollectionNft.mint.publicKey,
    "devnet"
  )}`
);
