import { TokenInfo } from "@solana/spl-token-registry";
import { PublicKey } from "@solana/web3.js";

export const CREATOR_ADDRESS: string =
  process.env.NEXT_PUBLIC_NARENTINE_CREATOR_ADDRESS || "";

export const COLLECTION_SYMBOL: string =
  process.env.NEXT_PUBLIC_NARENTINE_COLLECTION_SYMBOL || "";

export const STAKING_WALLET_ADDRESS: string =
  process.env.NEXT_PUBLIC_STAKING_WALLET_ADDRESS || "";

export const RPC_ENDPOINT: string = process.env.NEXT_PUBLIC_RPC_ENDPOINT || "";
export const KEYPAIR_FILE: string = process.env.KEYPAIR_FILE || "";

// export const NAV_HEIGHT_IN_REMS = 32;
export const NAV_HEIGHT_IN_REMS = "16";

export const MAX_MESSAGE_LENGTH_IN_CHARS = 250;

export const DEFAULT_SOL_TOKEN: TokenInfo = {
  address: "So11111111111111111111111111111111111111112",
  chainId: 101, // doesn't matter, SOL is SOL
  symbol: "SOL",
  name: "Solana",
  decimals: 9,
  logoURI:
    "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  extensions: {
    coingeckoId: "solana",
    website: "https://solana.com/",
  },
};

export const UTF_8 = "utf-8";

export const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);
