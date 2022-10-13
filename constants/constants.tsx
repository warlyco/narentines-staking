import { TokenInfo } from "@solana/spl-token-registry";
import { PublicKey } from "@solana/web3.js";

export const CREATOR_ADDRESS: string =
  process.env.NEXT_PUBLIC_NARENTINE_CREATOR_ADDRESS || "";

export const NARENTINES_MINT_AUTHORITY: string =
  process.env.NEXT_PUBLIC_NARENTINES_MINT_AUTHORITY || "";

export const STAKING_COST_IN_SOL: string =
  process.env.NEXT_PUBLIC_STAKING_COST_IN_SOL || "";

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

export const PRIMARY_REWARD_AMOUNT_PER_DAY = process.env
  .NEXT_PUBLIC_PRIMARY_REWARD_AMOUNT
  ? Number(process.env.NEXT_PUBLIC_PRIMARY_REWARD_AMOUNT)
  : 3;

export const MS_PER_DAY = 86400000;

export enum ProfessionNames {
  BANKER = "Banker",
  FISHERMAN = "Fisherman",
  MINER = "Miner",
  SHEPHERD = "Shepherd",
  LUMBERJACK = "Lumberjack",
}

export enum ProfessionIds {
  BANKER = "8716a284-5481-4340-b166-4c2bd9da4a78",
  FISHERMAN = "ac2041be-89f0-429a-bb56-697b5805f50e",
  MINER = "c35c9543-0510-4f48-8d3b-9a45a60361db",
  SHEPHERD = "e0f980f4-2d5f-47b3-b8a0-9205c3469f40",
  LUMBERJACK = "62f9aaa0-e1b7-438c-949d-3d8ff6db4e5a",
}

enum ResourceName {
  GOODS = "GOODS",
  WOOD = "Wood",
  IRON = "Iron",
  COTTON = "Cotton",
  FISH = "Fish",
}

type Resource = {
  image: string;
  name: ResourceName;
  mintAmount: number;
  id: string;
};

export type Profession = {
  name: ProfessionNames;
  image?: string;
  dailyRewardRate: number;
  id: string;
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

export const MINIMUM_PAYOUT_AMOUNT = process.env
  .NEXT_PUBLIC_MINIMUM_PAYOUT_AMOUNT
  ? Number(process.env.NEXT_PUBLIC_MINIMUM_PAYOUT_AMOUNT)
  : 0.1;
