import {
  Metadata,
  Metaplex,
  Nft,
  toToken,
  toTokenAccount,
} from "@metaplex-foundation/js";
import {
  Account,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccount,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  BlockhashWithExpiryBlockHeight,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import axios from "axios";
import { STAKING_WALLET_ADDRESS } from "constants/constants";
import { useIsLoading } from "hooks/is-loading";
import { useCallback, useState } from "react";
import { WalletTypes } from "types";

type Props = {
  activeWallet: WalletTypes;
  nft: Metadata;
  fetchNfts: () => Promise<void>;
};

enum Professions {
  FISHING = "FISHING",
  MINING = "MINING",
  FARMING = "FARMING",
}

const StakeUnstakeButtons = ({ activeWallet, nft, fetchNfts }: Props) => {
  const { setIsLoading, setLoadingMessage } = useIsLoading();
  const [profession, setProfession] = useState<Professions | null>(null);

  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const selectProfession = (profession: string) => {
    setProfession(profession as Professions);
  };

  const handleSendTransaction = useCallback(
    async ({
      transaction,
      latestBlockHash,
    }: {
      transaction: Transaction;
      latestBlockHash: BlockhashWithExpiryBlockHeight;
    }) => {
      if (!signTransaction || !publicKey) return;
      try {
        const signed = await signTransaction(transaction);
        let signature;
        try {
          signature = await connection.sendRawTransaction(signed.serialize());
        } catch (error) {
          console.log("sendRawTransaction error", error);
          // handleRollbackPurchase(id, "Your purchase could not be completed.");
          return;
        }

        if (!signature) {
          throw new Error("Unkown error");
        }

        try {
          await connection.confirmTransaction({
            signature,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            blockhash: latestBlockHash.blockhash,
          });
        } catch (error) {
          console.error(error);
          return;
        }
      } catch (error) {
        console.error("error", error);
      } finally {
        setIsLoading(false);
      }
    },
    [connection, publicKey, setIsLoading, signTransaction]
  );

  const stakeNft = async () => {
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
        tokenMintAddress,
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

    try {
      // get token account if it exists
      toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        // @ts-ignore
        publicKey,
        tokenMintAddress,
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
        tokenMintAddress,
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
                tokenMintAddress,
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
              signature = await connection.sendRawTransaction(
                signed.serialize()
              );
              await connection.confirmTransaction({
                signature,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                blockhash: latestBlockHash.blockhash,
              });
              toTokenAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                // @ts-ignore
                publicKey,
                tokenMintAddress,
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
            debugger;
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

  const unstakeNft = async () => {
    if (!publicKey || !signTransaction) {
      console.log("error", "Wallet not connected!");
      return;
    }
    if (!STAKING_WALLET_ADDRESS) {
      throw new Error("STAKING_WALLET_ADDRESS is not defined");
    }
    setIsLoading(true, "Unstaking...");
    const tokenMintAddress = nft.mintAddress;
    const amount = 1;

    try {
      const { data } = await axios.post("/api/unstake", {
        mintAddress: tokenMintAddress,
        publicKey: publicKey.toString(),
      });
      console.log(data?.confirmation);
      fetchNfts();
    } catch (error) {
      console.error(error);
      debugger;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full space-x-3">
      <button
        className="flex-grow border-2 border-green-800 uppercase bg-green-800 p-2 pt-3 rounded text-amber-200 hover:bg-amber-200 hover:text-green-800 font-medium"
        onClick={activeWallet === WalletTypes.USER ? stakeNft : unstakeNft}
      >
        {activeWallet === WalletTypes.USER ? "Stake" : "Unstake"}
      </button>
    </div>
  );
};

export default StakeUnstakeButtons;
