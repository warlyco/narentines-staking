import { Metadata } from "@metaplex-foundation/js";
import {
  Account,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createApproveCheckedInstruction,
  createAssociatedTokenAccountInstruction,
  createFreezeAccountInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import axios from "axios";
import { STAKING_WALLET_ADDRESS } from "constants/constants";
import { useIsLoading } from "hooks/is-loading";
import toast from "react-hot-toast";

type Params = {
  publicKey: PublicKey;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  nft: Metadata;
  connection: Connection;
  setIsLoading: (isLoading: boolean, message?: string) => void;
  fetchNfts: () => Promise<void>;
  professionId: string;
};

const stakeNftsNonCustodial = async ({
  publicKey,
  signTransaction,
  nft,
  connection,
  setIsLoading,
  fetchNfts,
  professionId,
}: Params) => {
  if (!publicKey || !signTransaction) {
    console.log("error", "Wallet not connected!");
    return;
  }
  setIsLoading(true, "Staking...");
  const tokenMintAddress = nft.mintAddress;
  const amount = 1;

  let tokenAccount;
  try {
    tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      // @ts-ignore
      publicKey,
      new PublicKey(tokenMintAddress),
      publicKey,
      false,
      "confirmed",
      {},
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
  } catch (error) {
    console.error(error);
    setIsLoading(false);
    return;
  }

  const transaction = new Transaction();
  transaction.add(
    createApproveCheckedInstruction(
      tokenAccount.address, // token account
      new PublicKey(tokenMintAddress), // mint
      new PublicKey(STAKING_WALLET_ADDRESS), // delegate
      publicKey, // owner of token account
      1, // amount, if your deciamls is 8, 10^8 for 1 token
      0 // decimals
    )
  );

  transaction.add(
    createFreezeAccountInstruction(
      tokenAccount.address,
      new PublicKey(tokenMintAddress),
      new PublicKey(STAKING_WALLET_ADDRESS),
      undefined,
      TOKEN_PROGRAM_ID
    )
  );

  const latestBlockHash = await connection.getLatestBlockhash();
  transaction.recentBlockhash = latestBlockHash.blockhash;
  transaction.feePayer = publicKey;

  let signed;
  try {
    signed = await signTransaction(transaction);
  } catch (error) {
    setIsLoading(false);
    return;
  }

  let signature;
  try {
    signature = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(
      {
        signature,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        blockhash: latestBlockHash.blockhash,
      },
      "finalized"
    );

    await axios.post("/api/update-nfts-holder", {
      mintAddresses: [tokenMintAddress],
      walletAddress: STAKING_WALLET_ADDRESS,
      professionId,
    });

    await axios.post("/api/reset-nft-claim-time", {
      mintAddress: tokenMintAddress,
    });

    toast.custom(
      <div className="flex flex-col bg-amber-200 rounded-xl text-xl deep-shadow p-4 px-6 border-slate-400 text-center duration-200">
        <div className="font-bold text-3xl">Staked!</div>
      </div>
    );

    setTimeout(() => {
      fetchNfts();
    }, 1000);
  } catch (error) {
    console.log("could not confirm", error);
    // handleRollbackPurchase(id, "Your purchase could not be completed.");
    return;
  } finally {
    setIsLoading(false);
  }

  setIsLoading(false);
};

export default stakeNftsNonCustodial;
