import { Metadata } from "@metaplex-foundation/js";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { ProfessionIds, STAKING_WALLET_ADDRESS } from "constants/constants";
import { useIsLoading } from "hooks/is-loading";
import toast from "react-hot-toast";
import { WalletTypes } from "types";
import stakeNftsNonCustodial from "utils/stake-nfts-non-custodial";

type Props = {
  hasUnclaimedRewards: boolean;
  activeWallet: WalletTypes;
  nft: Metadata;
  professionId: ProfessionIds;
  fetchNfts: () => Promise<void>;
  claimReward: () => Promise<boolean | undefined>;
  removeFromDispayedNfts: (nft: any) => void;
};

const StakeUnstakeButtons = ({
  activeWallet,
  nft,
  fetchNfts,
  professionId,
  removeFromDispayedNfts,
  hasUnclaimedRewards,
  claimReward,
}: Props) => {
  const { setIsLoading, setLoadingMessage } = useIsLoading();

  const { publicKey, signTransaction, sendTransaction, signAllTransactions } =
    useWallet();
  const { connection } = useConnection();

  const stakeNft = async () => {
    if (!publicKey || !signTransaction) {
      console.log("error", "Wallet not connected!");
      return;
    }
    stakeNftsNonCustodial({
      removeFromDispayedNfts,
      publicKey,
      signTransaction,
      sendTransaction,
      signAllTransactions,
      nft,
      connection,
      setIsLoading,
      fetchNfts,
      professionId,
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

    let claimWasSuccessful;
    if (hasUnclaimedRewards) {
      claimWasSuccessful = await claimReward();
    }

    if (hasUnclaimedRewards && !claimWasSuccessful) {
      toast.custom(
        <div className="flex flex-col bg-amber-200 rounded-xl text-xl deep-shadow p-4 px-6 border-slate-400 text-center duration-200">
          <div className="font-bold text-3xl">
            Could not claim reward, try again.
          </div>
        </div>
      );
      throw new Error("Claiming rewards failed");
    }

    setIsLoading(true, "Unstaking...");
    const tokenMintAddress = nft.mintAddress;

    // TODO: claim rewards

    try {
      const { data, status } = await axios.post("/api/thaw-token-account", {
        tokenMintAddress,
        walletAddress: publicKey.toString(),
      });
      if (status === 200) {
        // TODO: update timestamp
      }
      toast.custom(
        <div className="flex flex-col bg-amber-200 rounded-xl text-xl deep-shadow p-4 px-6 border-slate-400 text-center duration-200">
          <div className="font-bold text-3xl">Unstaked!</div>
        </div>
      );

      removeFromDispayedNfts(tokenMintAddress);
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
