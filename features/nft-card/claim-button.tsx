import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { GOODS_TOKEN_MINT_ADDRESS } from "constants/constants";
import { useIsLoading } from "hooks/is-loading";

type Props = {
  mintAddress: string;
  primaryRewardAmount: number;
};

const ClaimButton = ({ mintAddress, primaryRewardAmount }: Props) => {
  const { setIsLoading } = useIsLoading();
  const { publicKey } = useWallet();

  const claimPrimaryReward = async () => {
    setIsLoading(true, `Claiming ${primaryRewardAmount} $GOODS`);
    await axios.post("/api/init-reward-claim", {
      mintAddress,
      amount: primaryRewardAmount,
      rewardTokenAddress: GOODS_TOKEN_MINT_ADDRESS,
      walletAddress: publicKey?.toString(),
    });
    setIsLoading(false);
  };

  return (
    <button
      className="flex-grow border-2 border-green-800 uppercase bg-green-800 p-2 pt-3 rounded text-amber-200 hover:bg-amber-200 hover:text-green-800 font-medium"
      onClick={claimPrimaryReward}
    >
      Claim
    </button>
  );
};

export default ClaimButton;
