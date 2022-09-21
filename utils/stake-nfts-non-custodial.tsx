import { Metadata, Metaplex } from "@metaplex-foundation/js";
import { createFreezeDelegatedAccountInstruction } from "@metaplex-foundation/mpl-token-metadata";
import {
  Account,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createApproveCheckedInstruction,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SendTransactionOptions } from "@solana/wallet-adapter-base";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SolanaJSONRPCError,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import axios from "axios";
import {
  STAKING_COST_IN_SOL,
  STAKING_WALLET_ADDRESS,
} from "constants/constants";
import { useIsLoading } from "hooks/is-loading";
import toast from "react-hot-toast";

type Params = {
  publicKey: PublicKey;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions:
    | ((transaction: Transaction[]) => Promise<Transaction[]>)
    | undefined;
  sendTransaction: (
    transaction: Transaction,
    connection: Connection,
    options?: SendTransactionOptions | undefined
  ) => Promise<string>;
  nft: Metadata;
  connection: Connection;
  setIsLoading: (isLoading: boolean, message?: string) => void;
  fetchNfts: () => Promise<void>;
  professionId: string;
  removeFromDispayedNfts: (nft: any) => void;
};

const stakeNftsNonCustodial = async ({
  publicKey,
  signTransaction,
  signAllTransactions,
  sendTransaction,
  nft,
  connection,
  setIsLoading,
  fetchNfts,
  professionId,
  removeFromDispayedNfts,
}: Params) => {
  if (!publicKey || !signTransaction || !signAllTransactions) {
    console.log("error", "Wallet not connected!");
    return;
  }
  if (!STAKING_WALLET_ADDRESS) {
    throw new Error("STAKING_WALLET_ADDRESS is not defined");
  }
  setIsLoading(true, "Staking...");
  const tokenMintAddress = nft.mintAddress;

  const { data: tokenAccount } = await axios.post("/api/get-token-account", {
    tokenMintAddress,
    walletAddress: publicKey.toString(),
  });

  if (!tokenAccount || !tokenAccount.address) {
    throw new Error("tokenAccount is undefined");
  }

  console.log({
    publicKey,
    toPubkey: new PublicKey(STAKING_WALLET_ADDRESS),
    tokenAccountAddress: tokenAccount.address,
    tokenMintAddress: new PublicKey(tokenMintAddress),
  });

  const amountOfSol = Number(STAKING_COST_IN_SOL) || 0.01;
  const solInLamports = amountOfSol * LAMPORTS_PER_SOL;
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: new PublicKey(STAKING_WALLET_ADDRESS),
      lamports: solInLamports,
    }),
    createApproveCheckedInstruction(
      new PublicKey(tokenAccount.address),
      new PublicKey(tokenMintAddress),
      new PublicKey(STAKING_WALLET_ADDRESS),
      publicKey,
      1,
      0
    )
  );

  const latestBlockHash = await connection.getLatestBlockhash();
  transaction.recentBlockhash = latestBlockHash.blockhash;
  transaction.feePayer = publicKey;
  let signedTransaction;
  try {
    signedTransaction = await signTransaction(transaction);
  } catch (error) {
    setIsLoading(false);
    return;
  }

  let signature;
  try {
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize(),
      {
        preflightCommitment: "confirmed",
      }
    );
    const latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction(
      {
        signature,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        blockhash: latestBlockHash.blockhash,
      },
      "finalized"
    );

    const { data } = await axios.post("/api/freeze-token-account", {
      tokenMintAddress: tokenAccount.mint.toString(),
      walletAddress: publicKey.toString(),
    });

    console.log({ data, signature });

    toast.custom(
      <div className="flex flex-col bg-amber-200 rounded-xl deep-shadow p-4 px-6 border-slate-400 text-center duration-200">
        <div className="font-bold text-3xl">Staked!</div>
        <a
          className="underline"
          href={`https://explorer.solana.com/tx/${signature}`}
          target="_blank"
          rel="noreferrer"
        >
          View on Solana Explorer
        </a>
      </div>
    );

    removeFromDispayedNfts(tokenMintAddress);
  } catch (error: any) {
    console.log("could not confirm", error);
    if (error.message.includes("Node is behind by")) {
      toast.error("Solana node is behind. Please try again later.");
    }
    // handleRollbackPurchase(id, "Your purchase could not be completed.");
    return;
  } finally {
    setIsLoading(false);
  }
};

export default stakeNftsNonCustodial;
