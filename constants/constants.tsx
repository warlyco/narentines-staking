import { TokenInfo } from "@solana/spl-token-registry";
import { PublicKey } from "@solana/web3.js";

export const CREATOR_ADDRESS: string =
  process.env.NEXT_PUBLIC_NARENTINE_CREATOR_ADDRESS || "";

export const COLLECTION_SYMBOL: string =
  process.env.NEXT_PUBLIC_NARENTINE_COLLECTION_SYMBOL || "";

export const STAKING_WALLET_ADDRESS: string =
  process.env.NEXT_PUBLIC_STAKING_WALLET_ADDRESS || "";
export const GOODS_TOKEN_MINT_ADDRESS: string =
  process.env.NEXT_PUBLIC_GOODS_TOKEN_MINT_ADDRESS || "";

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

export const PRIMARY_REWARD_AMOUNT_PER_DAY = 3;

export const MS_PER_DAY = 86400000;

enum ProfessionName {
  NONE = "NONE",
  BANKER = "Banker",
  LUMBERJACK = "Lumberjack",
  SHEPHERD = "Shepherd",
  FISHERMAN = "Fisherman",
}

enum ResourceName {
  GOODS = "GOODS",
  LUMBER = "Lumber",
  IRON = "Iron",
  COTTON = "Cotton",
  FISH = "Fish",
}

type Resource = {
  image: string;
  name: ResourceName;
  mintAmount: number;
};

type Profession = {
  name: ProfessionName;
  image?: string;
  dailyRewardRate: number;
  resource: Resource;
};

export type CollectionNft = {
  image: string;
  name: string;
  unclaimedAmount: number;
  timestamp: number;
  lastClaimTimestamp: string | null;
  mintAddress: string;
  ownerWalletAddress: string | null;
  profession: Profession;
};
