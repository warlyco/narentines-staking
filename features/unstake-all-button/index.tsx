import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { STAKING_WALLET_ADDRESS } from "constants/constants";
import { useIsLoading } from "hooks/is-loading";
import toast from "react-hot-toast";
import stakeNftsNonCustodial from "utils/stake-nfts-non-custodial";

type Props = {
  nfts: any[];
  removeFromDispayedNfts: (nft?: any[]) => void;
};

const UnstakeAllButton = ({ nfts, removeFromDispayedNfts }: Props) => {
  const { isLoading, setIsLoading } = useIsLoading();
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();

  const unstakeNft = async () => {
    if (!publicKey || !signTransaction) {
      console.log("error", "Wallet not connected!");
      return;
    }
    if (!STAKING_WALLET_ADDRESS) {
      throw new Error("STAKING_WALLET_ADDRESS is not defined");
    }

    // let claimWasSuccessful;
    // if (hasUnclaimedRewards) {
    //   claimWasSuccessful = await claimReward();
    // }

    // if (hasUnclaimedRewards && !claimWasSuccessful) {
    //   toast.custom(
    //     <div className="flex flex-col bg-amber-200 rounded-xl text-xl deep-shadow p-4 px-6 border-slate-400 text-center duration-200">
    //       <div className="font-bold text-3xl">
    //         Could not claim reward, try again.
    //       </div>
    //     </div>
    //   );
    //   throw new Error("Claiming rewards failed");
    // }

    // claim before unstaking
    const tokenMintAddresses = nfts.map((nft) => nft.mintAddress);

    setIsLoading(true, "Unstaking...");

    try {
      const { data, status } = await axios.post("/api/thaw-token-account", {
        tokenMintAddresses,
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

      removeFromDispayedNfts();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const unstakeAllNfts = () => {
    if (!publicKey || !signTransaction) return;
  };
  return (
    <button
      onClick={unstakeAllNfts}
      className="border-2 border-green-800 bg-green-800 text-2xl p-2 rounded text-amber-400 hover:bg-amber-200 hover:text-green-800 uppercase"
    >
      Untake All
    </button>
  );
};

export default UnstakeAllButton;
