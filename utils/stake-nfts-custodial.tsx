import { Metadata } from "@metaplex-foundation/js";
import {
  Account,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
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

const stakeNftsCustodial = async ({
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
  if (!STAKING_WALLET_ADDRESS) {
    throw new Error("STAKING_WALLET_ADDRESS is not defined");
  }
  setIsLoading(true, "Staking...");
  const tokenMintAddress = nft.mintAddress;
  const amount = 1;

  let fromTokenAccount;
  try {
    fromTokenAccount = await getOrCreateAssociatedTokenAccount(
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

  let toTokenAccount;
  const latestBlockhash = await connection.getLatestBlockhash();
  const transaction = new Transaction({ ...latestBlockhash });

  try {
    // get token account if it exists
    toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      // @ts-ignore
      publicKey,
      new PublicKey(tokenMintAddress),
      new PublicKey(STAKING_WALLET_ADDRESS),
      false,
      "confirmed",
      {},
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
  } catch (error) {
    // if it doesn't exist (check error), create it

    // get address of ATA
    const associatedToken = await getAssociatedTokenAddress(
      new PublicKey(tokenMintAddress),
      new PublicKey(STAKING_WALLET_ADDRESS),
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    let account: Account;
    try {
      // use the address to get the account
      account = await getAccount(
        connection,
        associatedToken,
        "confirmed",
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
    } catch (error: unknown) {
      if (
        error instanceof TokenAccountNotFoundError ||
        error instanceof TokenInvalidAccountOwnerError
      ) {
        try {
          // if the account doesn't exist, create it
          transaction.add(
            createAssociatedTokenAccountInstruction(
              publicKey,
              associatedToken,
              new PublicKey(STAKING_WALLET_ADDRESS),
              new PublicKey(tokenMintAddress),
              TOKEN_PROGRAM_ID,
              ASSOCIATED_TOKEN_PROGRAM_ID
            )
          );

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
            await connection.confirmTransaction({
              signature,
              lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
              blockhash: latestBlockhash.blockhash,
            });
            toTokenAccount = await getOrCreateAssociatedTokenAccount(
              connection,
              // @ts-ignore
              publicKey,
              new PublicKey(tokenMintAddress),
              new PublicKey(STAKING_WALLET_ADDRESS),
              false,
              "confirmed",
              {},
              TOKEN_PROGRAM_ID,
              ASSOCIATED_TOKEN_PROGRAM_ID
            );
          } catch (error) {
            console.log("sendRawTransaction error", error);
            setIsLoading(false);
            // handleRollbackPurchase(id, "Your purchase could not be completed.");
            return;
          }
        } catch (error: unknown) {
          setIsLoading(false);
          throw error;
        }
      } else {
        setIsLoading(false);
        throw error;
      }
    }
  }

  if (!toTokenAccount) {
    throw new Error("toTokenAccount is undefined");
  }

  transaction.add(
    createTransferInstruction(
      fromTokenAccount.address,
      toTokenAccount.address,
      publicKey,
      amount,
      [],
      TOKEN_PROGRAM_ID
    )
  );

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
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        blockhash: latestBlockhash.blockhash,
      },
      "confirmed"
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
};

export default stakeNftsCustodial;
