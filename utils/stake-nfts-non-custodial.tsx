import { Metadata } from "@metaplex-foundation/js";
import {
  Account,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createMultisig,
  createTransferInstruction,
  freezeAccount,
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
};

const stakeNftsNonCustodial = async ({
  publicKey,
  signTransaction,
  nft,
  connection,
  setIsLoading,
  fetchNfts,
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
  const transaction = new Transaction();
  const stakingWallet = new PublicKey(STAKING_WALLET_ADDRESS);
  debugger;
  const multisigKey = await createMultisig(
    connection,
    //@ts-ignore
    publicKey,
    [publicKey, new PublicKey(STAKING_WALLET_ADDRESS)],
    2
  );
  debugger;
  try {
    // freezeAccount
    // get token account if it exists
    toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      // @ts-ignore
      publicKey,
      new PublicKey(tokenMintAddress),
      multisigKey,
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
      multisigKey,
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
              multisigKey,
              new PublicKey(tokenMintAddress),
              TOKEN_PROGRAM_ID,
              ASSOCIATED_TOKEN_PROGRAM_ID
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
            await connection.confirmTransaction({
              signature,
              lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
              blockhash: latestBlockHash.blockhash,
            });
            toTokenAccount = await getOrCreateAssociatedTokenAccount(
              connection,
              // @ts-ignore
              publicKey,
              new PublicKey(tokenMintAddress),
              multisigKey,
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
      multisigKey,
      amount,
      [],
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

export default stakeNftsNonCustodial;
