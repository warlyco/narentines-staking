import { useWallet } from "@solana/wallet-adapter-react";
import { useIsLoading } from "hooks/is-loading";
import { useCallback, useEffect, useState } from "react";
import claimPrimaryRewards from "utils/claim-primary-rewards";

type Props = {
  nfts: any[];
  walletAddress: string;
  refetch: any;
};

const ClaimAllButton = ({ nfts, walletAddress, refetch }: Props) => {
  const { isLoading, setIsLoading } = useIsLoading();
  const [payoutAmount, setPayoutAmount] = useState(0);
  const { publicKey } = useWallet();

  const calulateRewards = useCallback(() => {
    if (!nfts?.length) {
      setPayoutAmount(0);
      return;
    }
    let totalPayoutAmount = 0;
    for (const nft of nfts) {
      totalPayoutAmount += nft.unclaimedRewardsAmount;
    }
    setPayoutAmount(Number(totalPayoutAmount));
  }, [nfts]);

  const claimAllRewards = () => {
    if (!publicKey) return;

    setIsLoading(true, `Claiming ${payoutAmount} $GOODS`);
    claimPrimaryRewards({
      nfts,
      primaryRewardAmount: payoutAmount,
      setIsLoading,
      publicKey,
      setPrimaryRewardAmount: setPayoutAmount,
      refetch,
    });
  };

  useEffect(() => {
    calulateRewards();
  }, [calulateRewards, nfts]);

  return (
    <button
      onClick={claimAllRewards}
      className="border-2 border-green-800 bg-green-800 text-2xl p-2 rounded text-amber-400 hover:bg-amber-200 hover:text-green-800 uppercase px-3"
    >
      {`Claim All`}
    </button>
  );
};

export default ClaimAllButton;
