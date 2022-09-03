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
import toast from "react-hot-toast";
import { WalletTypes } from "types";
import stakeNftsCustodial from "utils/stake-nfts-custodial";
import stakeNftsNonCustodial from "utils/stake-nfts-non-custodial";

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
    stakeNftsCustodial({
      publicKey,
      signTransaction,
      nft,
      connection,
      setIsLoading,
      fetchNfts,
    });
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
      const { data, status } = await axios.post("/api/unstake", {
        mintAddress: tokenMintAddress,
        publicKey: publicKey.toString(),
      });
      if (status === 200) {
        axios.post("/api/update-nfts-holder", {
          mintAddresses: [tokenMintAddress],
          walletAddress: publicKey?.toString(),
        });
      }
      toast.custom(
        <div className="flex flex-col bg-amber-200 rounded-xl text-xl deep-shadow p-4 px-6 border-slate-400 text-center duration-200">
          <div className="font-bold text-3xl mb-2">Unstaked!</div>
        </div>
      );

      fetchNfts();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className="flex-grow border-2 border-green-800 uppercase bg-green-800 p-2 pt-3 rounded text-amber-200 hover:bg-amber-200 hover:text-green-800 font-medium"
      onClick={activeWallet === WalletTypes.USER ? stakeNft : unstakeNft}
    >
      {activeWallet === WalletTypes.USER ? "Stake" : "Unstake"}
    </button>
  );
};

export default StakeUnstakeButtons;
