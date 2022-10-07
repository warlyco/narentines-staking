import { Metadata, Metaplex } from "@metaplex-foundation/js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createApproveCheckedInstruction,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SendTransactionOptions } from "@solana/wallet-adapter-base";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import axios from "axios";
import {
  STAKING_COST_IN_SOL,
  STAKING_WALLET_ADDRESS,
} from "constants/constants";
import showToast from "features/toasts/toast";
import { useIsLoading } from "hooks/is-loading";
import { chunk } from "lodash";
import toast from "react-hot-toast";

const INSTRUCTIONS_PER_TRANSACTION = 9;

type Params = {
  publicKey: PublicKey;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  nfts: Metadata[];
  connection: Connection;
  setIsLoading: (isLoading: boolean, message?: string) => void;
  professionId?: string;
  removeFromDispayedNfts: (nft: any[]) => void;
};

const stakeNftsNonCustodial = async ({
  publicKey,
  signTransaction,
  nfts,
  connection,
  setIsLoading,
  professionId,
  removeFromDispayedNfts,
  signAllTransactions,
}: Params) => {
  if (!publicKey || !signTransaction) {
    console.log("error", "Wallet not connected!");
    return;
  }
  if (!STAKING_WALLET_ADDRESS) {
    throw new Error("STAKING_WALLET_ADDRESS is not defined");
  }

  const tokenMintAddresses = nfts.map((nft) => nft.mintAddress);

  const amountOfSol = Number(STAKING_COST_IN_SOL) || 0.01;
  const solInLamports = amountOfSol * LAMPORTS_PER_SOL;

  let tokenAccountMintAddresses: string[] = [];
  const splitTokenMintAddresses = chunk(
    tokenMintAddresses.slice(0, 20),
    INSTRUCTIONS_PER_TRANSACTION
  );

  setIsLoading(true, "Connecting to Solana...");
  const latestBlockhash = await connection.getLatestBlockhash();
  const paymentTx = new Transaction({ ...latestBlockhash });
  paymentTx.add(
    SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: new PublicKey(STAKING_WALLET_ADDRESS),
      lamports: solInLamports,
    })
  );
  let transactions = [paymentTx];
  for (const mintAddresses of splitTokenMintAddresses) {
    const transaction = new Transaction({ ...latestBlockhash });
    for (const tokenMintAddress of mintAddresses) {
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
        tokenAccountMintAddresses.push(tokenAccount.mint.toString());
      } catch (error) {
        console.error(error);
        return;
      }

      if (!tokenAccount || !tokenAccount.address) {
        throw new Error("tokenAccount is undefined");
      }

      transaction.add(
        createApproveCheckedInstruction(
          new PublicKey(tokenAccount.address),
          new PublicKey(tokenMintAddress),
          new PublicKey(STAKING_WALLET_ADDRESS),
          publicKey,
          1,
          0
        )
      );
    }
    paymentTx.feePayer = publicKey;
    transaction.feePayer = publicKey;

    transactions.push(transaction);
  }
  let signedTransactions;
  try {
    signedTransactions = await signAllTransactions(transactions);
  } catch (error) {
    setIsLoading(false);
    return;
  }

  console.log({ signedTransactions });

  let signature;
  try {
    setIsLoading(true, "Sending transaction to Solana...");
    for (let signedTransaction of signedTransactions) {
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          preflightCommitment: "confirmed",
        }
      );
      console.log({ signature });
      const latestBlockHash = await connection.getLatestBlockhash();
      const confirmation = await connection.confirmTransaction(
        {
          signature,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
          blockhash: latestBlockHash.blockhash,
        },
        "confirmed"
      );
      console.log({ confirmation });
    }

    try {
      setIsLoading(true, "Staking NFTs...");
      let freezeReqs = [];
      let resetReqs = [];
      for (const tokenMintAddresses of splitTokenMintAddresses) {
        const freezeReq = axios.post("/api/freeze-token-accounts", {
          tokenMintAddresses,
          walletAddress: publicKey.toString(),
        });
        const resetReq = axios.post("/api/reset-nfts-claim-time", {
          mintAddresses: tokenMintAddresses,
        });
        freezeReqs.push(freezeReq);
        resetReqs.push(resetReq);
      }
      const responses = await Promise.all(freezeReqs);
      console.log({ responses });

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

      removeFromDispayedNfts(tokenMintAddresses);
    } catch (error) {
      showToast({
        primaryMessage: "There was a problem staking",
        secondaryMessage: "Please try again",
      });
    }
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
